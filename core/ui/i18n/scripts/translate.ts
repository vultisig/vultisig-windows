import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createTsFile } from '@lib/codegen/utils/createTsFile'
import { without } from '@vultisig/lib-utils/array/without'

import { Language, languages, primaryLanguage } from '../Language'
import { translations } from '../translations'
import { findI18nSyntaxIssues } from '../utils/i18nSyntax'
import { translateTexts } from '../utils/translateTexts'
import {
  flattenTranslationRecord,
  readTranslationRecordFromSource,
} from '../utils/translationRecords'

type RecursiveRecord = {
  [key: string]: string | RecursiveRecord
}

type ProcessTranslationsInput = {
  sourceCopy: RecursiveRecord
  targetCopy: RecursiveRecord
  fromLang: Language
  toLang: Language
  changedSourceKeys: Set<string>
}

type GetChangedSourceKeysInput = {
  sourceCopy: RecursiveRecord
}

const copyDirectory = '../locales'

const currentDirname = dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(currentDirname, '../../../..')
const sourceLocaleFilePath = 'core/ui/i18n/locales/en.ts'
const sourceChangeBaseRef = process.env.I18N_TRANSLATE_BASE_REF ?? 'HEAD'

const topLevelTranslationOverrides: Partial<
  Record<Language, Record<string, string>>
> = {
  ko: {
    // Google Translate renders "rebond" as reconnecting, which is misleading
    // on a transaction approval surface. Keep the THORChain operation name.
    signed_tx_you_are_rebonding: '재본딩 중이에요',
    signed_tx_rebonded: '재본딩됨',
    // Machine translation drops the particles after {{name}} and uses the
    // -십시오 form the rest of the file doesn't.
    send_receiver_name_lookup_failed:
      '{{name}}을(를) 조회할 네임 서비스에 연결할 수 없습니다. 연결 상태를 확인하고 다시 시도하세요.',
    send_receiver_name_no_address_for_chain:
      '{{name}}에 등록된 {{chain}} 주소가 없습니다.',
    send_receiver_name_not_found:
      '{{name}}은(는) 등록되지 않았습니다. 이름을 확인하고 다시 시도하세요.',
    send_receiver_name_unsupported_chain:
      '{{name}}은(는) {{chain}}에서 사용할 수 없습니다. 대신 {{chain}} 주소를 입력하세요.',
  },
  es: {
    // Machine translation leaves stray spaces before punctuation around placeholders.
    ton_gasless_description:
      'No se necesita GRAM: un relé paga el gas de la red y cobra en su lugar una pequeña comisión en {{ticker}}.',
    // Same stray spaces, and machine translation picks the formal "usted" the rest of the file doesn't use.
    send_receiver_name_lookup_failed:
      'No se pudo acceder al servicio de nombres para buscar {{name}}. Comprueba tu conexión e inténtalo de nuevo.',
    send_receiver_name_no_address_for_chain:
      'No hay ninguna dirección {{chain}} registrada para {{name}}.',
    send_receiver_name_not_found:
      '{{name}} no está registrado. Comprueba el nombre e inténtalo de nuevo.',
    send_receiver_name_unsupported_chain:
      '{{name}} no se puede usar en {{chain}}. Ingresa una dirección {{chain}} en su lugar.',
  },
  hr: {
    // Machine translation leaves stray spaces before punctuation around placeholders.
    ton_gasless_description:
      'Nije potreban GRAM: relej plaća mrežni plin i umjesto toga naplaćuje malu proviziju u {{ticker}}.',
    send_receiver_name_lookup_failed:
      'Nije moguće pristupiti servisu imena za pretraživanje {{name}}. Provjerite vezu i pokušajte ponovno.',
    send_receiver_name_no_address_for_chain:
      'Nije registrirana nijedna adresa {{chain}} za {{name}}.',
    send_receiver_name_unsupported_chain:
      '{{name}} se ne može koristiti na {{chain}}. Umjesto toga unesite adresu {{chain}}.',
  },
  pt: {
    // Machine translation leaves stray spaces before punctuation around placeholders.
    ton_gasless_description:
      'Não é necessário GRAM: um relay paga o gás da rede e cobra, em vez disso, uma pequena comissão em {{ticker}}.',
    send_receiver_name_lookup_failed:
      'Não foi possível acessar o serviço de nomes para consultar {{name}}. Verifique sua conexão e tente novamente.',
    send_receiver_name_no_address_for_chain:
      'Nenhum endereço {{chain}} está registrado para {{name}}.',
    send_receiver_name_unsupported_chain:
      '{{name}} não pode ser usado em {{chain}}. Insira um endereço {{chain}} em vez disso.',
  },
  it: {
    // Machine translation leaves stray spaces before punctuation around placeholders.
    ton_gasless_description:
      'GRAM non è necessario: un relay paga il gas di rete e addebita invece una piccola commissione in {{ticker}}.',
    send_receiver_name_lookup_failed:
      'Impossibile raggiungere il servizio di risoluzione dei nomi per cercare {{name}}. Verifica la connessione e riprova.',
    send_receiver_name_no_address_for_chain:
      'Nessun indirizzo {{chain}} è registrato per {{name}}.',
    // Machine translation also switches to the formal infinitive here.
    send_receiver_name_unsupported_chain:
      '{{name}} non può essere utilizzato su {{chain}}. Inserisci invece un indirizzo {{chain}}.',
  },
  de: {
    // Machine translation leaves a space before the hyphen in "{{chain}}-Adresse".
    send_receiver_name_no_address_for_chain:
      'Für {{name}} ist keine {{chain}}-Adresse registriert.',
    send_receiver_name_unsupported_chain:
      '{{name}} kann nicht für {{chain}} verwendet werden. Geben Sie stattdessen eine {{chain}}-Adresse ein.',
  },
  nl: {
    // Machine translation leaves stray spaces around placeholders, picks the
    // formal "uw" the rest of the file doesn't use, and says "naamserver" (DNS).
    send_receiver_name_lookup_failed:
      'De naamservice kon niet worden bereikt om {{name}} op te zoeken. Controleer je verbinding en probeer het opnieuw.',
    send_receiver_name_no_address_for_chain:
      'Er is geen {{chain}}-adres geregistreerd voor {{name}}.',
    send_receiver_name_unsupported_chain:
      '{{name}} kan niet worden gebruikt op {{chain}}. Voer in plaats daarvan een {{chain}}-adres in.',
  },
  ru: {
    // Machine translation leaves stray spaces before punctuation around
    // placeholders, and swaps the name and chain in the missing-address string.
    send_receiver_name_lookup_failed:
      'Не удалось подключиться к службе имен для поиска {{name}}. Проверьте соединение и повторите попытку.',
    send_receiver_name_no_address_for_chain:
      'Для {{name}} не зарегистрирован адрес {{chain}}.',
    send_receiver_name_unsupported_chain:
      '{{name}} нельзя использовать с {{chain}}. Вместо этого введите адрес {{chain}}.',
  },
  zh: {
    // Machine translation leaves stray spaces before punctuation around
    // placeholders, and swaps the name and chain in the missing-address string.
    send_receiver_name_lookup_failed:
      '无法连接到名称服务以查找{{name}}。请检查您的连接并重试。',
    send_receiver_name_no_address_for_chain: '{{name}}没有注册{{chain}}地址。',
    send_receiver_name_unsupported_chain:
      '{{name}}不能用于{{chain}}。请改用{{chain}}地址。',
  },
}

const isRecursiveRecord = (value: unknown): value is RecursiveRecord =>
  typeof value === 'object' && value !== null

const readGitFile = (filePath: string): string | undefined => {
  try {
    return execFileSync('git', ['show', `${sourceChangeBaseRef}:${filePath}`], {
      cwd: workspaceRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    return undefined
  }
}

const getChangedSourceKeys = ({
  sourceCopy,
}: GetChangedSourceKeysInput): Set<string> => {
  const previousSource = readGitFile(sourceLocaleFilePath)
  const changedKeys = new Set<string>()

  if (!previousSource) {
    return changedKeys
  }

  const previousCopy = readTranslationRecordFromSource({
    source: previousSource,
    exportName: primaryLanguage,
    fileName: sourceLocaleFilePath,
  })
  const previousValues = flattenTranslationRecord({ record: previousCopy })
  const currentValues = flattenTranslationRecord({ record: sourceCopy })

  currentValues.forEach((value, key) => {
    if (previousValues.get(key) !== value) {
      changedKeys.add(key)
    }
  })

  return changedKeys
}

const processTranslations = async ({
  sourceCopy,
  targetCopy,
  fromLang,
  toLang,
  changedSourceKeys,
}: ProcessTranslationsInput): Promise<RecursiveRecord> => {
  const result: RecursiveRecord = { ...targetCopy }
  const pendingTexts: string[] = []
  const pendingPaths: { key: string; path: string[] }[] = []

  const traverse = (
    source: RecursiveRecord,
    target: RecursiveRecord,
    currentPath: string[] = []
  ): void => {
    Object.keys(target).forEach(key => {
      if (!(key in source)) {
        delete target[key]
      }
    })

    Object.entries(source).forEach(([key, value]) => {
      const targetValue = target[key]
      const keyPath = [...currentPath, key].join('.')

      if (typeof value === 'string') {
        if (
          changedSourceKeys.has(keyPath) ||
          typeof targetValue !== 'string' ||
          findI18nSyntaxIssues({
            key: keyPath,
            locale: toLang,
            source: value,
            target: targetValue,
          }).length > 0
        ) {
          pendingTexts.push(value)
          pendingPaths.push({ key, path: currentPath })
        }

        return
      }

      if (!isRecursiveRecord(targetValue)) {
        target[key] = {}
      }

      const nestedTarget = target[key]

      if (isRecursiveRecord(nestedTarget)) {
        traverse(value, nestedTarget, [...currentPath, key])
      }
    })
  }

  traverse(sourceCopy, result)

  if (pendingTexts.length > 0) {
    console.log(
      `Found ${pendingTexts.length} missing, invalid, or outdated translations for ${toLang}`
    )
    const translatedTexts = await translateTexts({
      texts: pendingTexts,
      from: fromLang,
      to: toLang,
    })

    pendingPaths.forEach((item, index) => {
      let current = result

      for (const pathPart of item.path) {
        if (!isRecursiveRecord(current[pathPart])) {
          current[pathPart] = {}
        }

        const next = current[pathPart]

        if (isRecursiveRecord(next)) {
          current = next
        }
      }

      current[item.key] = translatedTexts[index]
    })
  }

  Object.entries(topLevelTranslationOverrides[toLang] ?? {}).forEach(
    ([key, value]) => {
      if (typeof sourceCopy[key] !== 'string') {
        throw new Error(
          `Translation override ${toLang}.${key} has no top-level source string`
        )
      }

      result[key] = value
    }
  )

  return result
}

const sync = async () => {
  if (!process.env.GOOGLE_TRANSLATE_PROJECT_ID) {
    console.log(
      'i18n:sync skipped — GOOGLE_TRANSLATE_PROJECT_ID env var is not set'
    )
    return
  }

  const credentialsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!credentialsEnv) {
    console.log(
      'i18n:sync skipped — GOOGLE_APPLICATION_CREDENTIALS env var is not set'
    )
    return
  }

  const credentialsPath = path.isAbsolute(credentialsEnv)
    ? credentialsEnv
    : path.resolve(workspaceRoot, credentialsEnv)

  if (!fs.existsSync(credentialsPath)) {
    console.log(
      `i18n:sync skipped — credentials file not found at ${credentialsPath}`
    )
    return
  }

  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath

  const sourceCopy = translations[primaryLanguage]
  const changedSourceKeys = getChangedSourceKeys({ sourceCopy })

  if (changedSourceKeys.size > 0) {
    console.log(
      `Found ${changedSourceKeys.size} changed English source string(s) since ${sourceChangeBaseRef}`
    )
  }

  await Promise.all(
    without(languages, primaryLanguage).map(async language => {
      const oldCopy = translations[language]
      const oldSerialized = JSON.stringify(oldCopy, null, 2)

      const result = await processTranslations({
        sourceCopy,
        targetCopy: oldCopy,
        fromLang: primaryLanguage,
        toLang: language,
        changedSourceKeys,
      })

      const newSerialized = JSON.stringify(result, null, 2)

      if (oldSerialized === newSerialized) {
        return
      }

      console.log(`Synced ${language} translations`)

      const content = `export const ${language} = ${newSerialized}`

      await createTsFile({
        directory: path.resolve(currentDirname, copyDirectory),
        fileName: language,
        content,
      })
    })
  )
}

sync().catch(error => {
  console.log(`i18n:sync failed: ${error.message}`)
  process.exitCode = 1
})
