import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WhatsAppButtonProps {
  whatsapp: string
}

export function WhatsAppButton({ whatsapp }: WhatsAppButtonProps) {
  const url = `https://wa.me/55${whatsapp.replace(/\D/g, '')}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Abrir WhatsApp de ${whatsapp}`}
    >
      <Button variant="ghost" size="sm" className="gap-1.5 text-green-700 hover:text-green-800 hover:bg-green-50">
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Button>
    </a>
  )
}
