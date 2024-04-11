import { Test, TestingModule } from '@nestjs/testing';
import { TypeBillService } from './type-bill.service';

describe('TypeBillService', () => {
  let service: TypeBillService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeBillService],
    }).compile();

    service = module.get<TypeBillService>(TypeBillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
