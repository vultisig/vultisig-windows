import { desktopDownloadUrl, extensionDownloadUrl } from '@core/config'
import { FacebookIcon } from '@lib/ui/icons/FacebookIcon'
import { LinkedinIcon } from '@lib/ui/icons/LinkedinIcon'
import { RedditIcon } from '@lib/ui/icons/RedditIcon'
import { TwitterIcon } from '@lib/ui/icons/TwitterIcon'
import { WhatsAppIcon } from '@lib/ui/icons/WhatsAppIcon'

import { useCore } from '../../../state/core'

export const useExternalLinks = () => {
  const { client } = useCore()

  const shareURL =
    client === 'desktop' ? desktopDownloadUrl : extensionDownloadUrl

  return [
    {
      icon: LinkedinIcon,
      url: `https://linkedin.com/sharing/share-offsite/?url=${shareURL}?utm_source=item-share-linkedin`,
    },
    {
      icon: FacebookIcon,
      url: `https://facebook.com/sharer/sharer.php?u=${shareURL}?utm_source=item-share-facebook`,
    },
    {
      icon: RedditIcon,
      url: `https://reddit.com/submit?url=${shareURL}?utm_source=item-share-reddit`,
    },
    {
      icon: WhatsAppIcon,
      url: `https://wa.me/?text=${shareURL}?utm_source=item-share-whatsapp`,
    },
    {
      icon: TwitterIcon,
      url: `https://twitter.com/intent/tweet?url=${shareURL}?utm_source=item-share-x`,
    },
  ]
}
