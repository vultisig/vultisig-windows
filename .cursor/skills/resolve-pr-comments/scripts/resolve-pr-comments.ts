const owner = 'vultisig'
const repo = 'vultisig-windows'

const githubToken = process.env.GITHUB_TOKEN

if (!githubToken) {
  console.error('Missing GITHUB_TOKEN environment variable')
  process.exit(1)
}

const prNumber = parseInt(process.argv[2], 10)

if (!prNumber || isNaN(prNumber)) {
  console.error('Usage: yarn tsx scripts/resolve-pr-comments.ts <PR_NUMBER>')
  process.exit(1)
}

const graphqlEndpoint = 'https://api.github.com/graphql'

type ReviewThread = {
  id: string
  isResolved: boolean
}

type ReviewThreadsResponse = {
  data?: {
    repository?: {
      pullRequest?: {
        reviewThreads: {
          nodes: ReviewThread[]
        }
      }
    }
  }
  errors?: Array<{ message: string }>
}

type ResolveThreadResponse = {
  data?: {
    resolveReviewThread?: {
      thread: { isResolved: boolean }
    }
  }
  errors?: Array<{ message: string }>
}

const fetchReviewThreads = async (): Promise<ReviewThread[]> => {
  const query = `
    query($owner: String!, $repo: String!, $pr: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $pr) {
          reviewThreads(first: 100) {
            nodes {
              id
              isResolved
            }
          }
        }
      }
    }
  `

  const response = await fetch(graphqlEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { owner, repo, pr: prNumber },
    }),
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = (await response.json()) as ReviewThreadsResponse

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
  }

  return data.data?.repository?.pullRequest?.reviewThreads.nodes ?? []
}

const resolveThread = async (threadId: string): Promise<void> => {
  const mutation = `
    mutation($threadId: ID!) {
      resolveReviewThread(input: { threadId: $threadId }) {
        thread { isResolved }
      }
    }
  `

  const response = await fetch(graphqlEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: mutation,
      variables: { threadId },
    }),
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = (await response.json()) as ResolveThreadResponse

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
  }
}

const run = async () => {
  console.log(`Fetching review threads for PR #${prNumber}...`)

  const threads = await fetchReviewThreads()
  const unresolvedThreads = threads.filter(t => !t.isResolved)

  if (unresolvedThreads.length === 0) {
    console.log('No unresolved review threads found.')
    return
  }

  console.log(
    `Found ${unresolvedThreads.length} unresolved thread(s). Resolving...`
  )

  for (const thread of unresolvedThreads) {
    await resolveThread(thread.id)
    console.log(`Resolved thread ${thread.id}`)
  }

  console.log(`Done! Resolved ${unresolvedThreads.length} thread(s).`)
}

run()
