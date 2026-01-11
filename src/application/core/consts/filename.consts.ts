export const BILL_MODULE = {
  controller: 'bill.controller.ts',
  service: 'bill.service.ts',
  createBillService: 'create-bill.service.ts',
  getBillService: 'get-bill.service.ts',
  updateBillService: 'update-bill.service.ts',
  quickSettleBillService: 'quick-settle-bill.service.ts',
  bodyQuickSettingMiddleware: 'body.quick-setting.middleware.ts'
}

export const CREDIT_CARD_MODULE = {
  controller: 'credit-card.controller.ts',
  service: 'credit-card.service.ts'
}

export const THEME_MODULE = {
  bodyMiddleware: 'body.theme.middleware.ts',
  updateBodyMiddleware: 'update.body.theme.middleware.ts',
  controller: 'theme.controller.ts',
  service: 'theme.service.ts'
}

export const BANK_MODULE = {
  service: 'bank.service.ts',
  bodyCreateMiddleware: 'body.create.bank.middleware.ts',
  bodyUpdateMiddleware: 'body.create.bank.middleware.ts'
}

export const CATEGORY_MODULE = {
  service: 'category.service.ts',
  controller: 'category.controller.ts'
}

export const SAVING_MODULE = {
  bodyMiddleware: 'body.saving.middleware.ts'
}
