import { CreateCreditCardDto } from './../dto/create-credit-card.dto'
import { Test, TestingModule } from '@nestjs/testing'
import { CreditCardService } from '../credit-card.service'
import { CreditCard } from '../credit-card.entity'
import { CreatedCreditCardData } from './stubs/data-credit-card.stub'
import { getRepositoryToken } from '@nestjs/typeorm'

const createCreditCard = () => {
  class createCreditCardDto extends CreateCreditCardDto {}
  return new createCreditCardDto()
}

const updateCreditCard = () => {
  class createCreditCardDto extends CreateCreditCardDto {}
  return new createCreditCardDto()
}

describe('CreditCardService', () => {
  let creditCardService: CreditCardService
  const mockedCreditCardRepository = {
    save: jest.fn().mockReturnValue(CreatedCreditCardData),
    update: jest
      .fn()
      .mockReturnValue({ ...CreatedCreditCardData, name: 'Credit Card Test Updated' }),
    delete: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    sum: jest.fn()
  }
  const creditCardRepository: typeof mockedCreditCardRepository =
    mockedCreditCardRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditCardService,
        {
          provide: getRepositoryToken(CreditCard),
          useValue: mockedCreditCardRepository
        }
      ]
    }).compile()

    creditCardService = module.get<CreditCardService>(CreditCardService)
  })

  it('should be defined', () => {
    expect(creditCardService).toBeDefined()
  })

  describe('Create Credit Card with success', () => {
    let result

    beforeEach(async () => {
      result = await creditCardService.create(createCreditCard())
    })
    jest.spyOn(creditCardRepository, 'save').mockReturnValueOnce(CreatedCreditCardData)

    it('should call save function', () => {
      expect(creditCardRepository.save).toHaveBeenCalled()
    })

    it('should return created credit card', () => {
      expect(result).toEqual(CreatedCreditCardData)
    })
  })

  describe('Update Credit Card with success', () => {
    let result
    const id = '0b44c4e8-bb56-4ad5-aebe-7f427886eca4'

    beforeEach(async () => {
      result = await creditCardService.update(id, updateCreditCard())
    })

    it('should call update function', () => {
      expect(mockedCreditCardRepository.update).toHaveBeenCalled()
    })

    it('should return updated credit card name', () => {
      expect(result.name).toEqual('Credit Card Test Updated')
    })
  })
})
