import { Test, TestingModule } from '@nestjs/testing';
import { UsermanagementController } from './usermanagement.controller';

describe('UsermanagementController', () => {
  let controller: UsermanagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsermanagementController],
    }).compile();

    controller = module.get<UsermanagementController>(UsermanagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
