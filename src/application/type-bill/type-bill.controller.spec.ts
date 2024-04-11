import { Test, TestingModule } from '@nestjs/testing';
import { TypeBillController } from './type-bill.controller';

describe('TypeBillController', () => {
  let controller: TypeBillController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeBillController],
    }).compile();

    controller = module.get<TypeBillController>(TypeBillController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
