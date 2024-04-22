export const TYPE_BILLS = [
  {
    name: 'Pix',
    description: 'Transaction between banks',
    icon: 'account_balance',
    referTo: 'betweenBanks'
  },
  {
    name: 'Credit card',
    description: 'Default credit card usage',
    icon: 'credit_card',
    referTo: 'creditCard'
  },
  {
    name: 'Buying',
    description: 'Normal/installment purchase in some company',
    icon: 'local_mall',
    referTo: 'company'
  },
  {
    name: 'Service',
    description:
      'Every-month purchases (such as eletricity, internet, water service, etc.)',
    icon: 'electrical_services',
    referTo: 'service'
  }
]
