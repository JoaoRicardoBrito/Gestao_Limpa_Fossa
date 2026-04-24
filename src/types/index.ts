export type AppointmentStatus =
  | 'pendente'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado'

export interface Appointment {
  id: string
  // Public site fields (existing columns)
  nome: string
  whatsapp: string
  endereco: string
  servico: string
  data_hora: string
  criado_em: string
  // Admin management fields (added by migration 001)
  status: AppointmentStatus
  atualizado_em: string | null
  concluido_em: string | null
  cancelado_em: string | null
  motivo_cancelamento: string | null
  notas: string | null
  valor: number | null
}

export interface AuthError {
  message: string
}
