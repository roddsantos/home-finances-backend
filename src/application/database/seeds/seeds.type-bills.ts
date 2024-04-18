export const TYPE_BILLS = [
  {
    name: 'Pix',
    description: 'Transação entre bancos',
    icon: 'account_balance',
    referTo: 'betweenBanks'
  },
  {
    name: 'Parcelamento',
    description: 'Dívida parcelada',
    icon: 'filter_3',
    referTo: 'installmentDebt'
  },
  {
    name: 'Compra',
    description: 'Compra feita em alguma empresa',
    icon: 'local_mall',
    referTo: 'billCompany'
  },
  {
    name: 'Movimentação de Reserva Bancária',
    description: 'Retirada/adição de fundos na conta bancária referente',
    icon: 'savings',
    referTo: 'referToBank'
  }
]
