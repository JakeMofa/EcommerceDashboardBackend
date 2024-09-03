import { Test } from '@nestjs/testing';
import { ForecastService } from './forecast.service';
import * as ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

jest.mock('@prisma/client');
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: { log: jest.fn() },
}));
const MockWorkbook = {
  xlsx: {
    load: jest.fn().mockResolvedValue(undefined),
  },
  worksheets: [
    {
      getRow: jest.fn().mockReturnValue({
        getCell: jest.fn().mockReturnValue({ value: { toString: () => '1000' } }),
      }),
    },
  ],
};

jest.mock('exceljs', () => {
  const originalModule = jest.requireActual('exceljs');
  return {
    __esModule: true,
    ...originalModule,
    Workbook: jest.fn(() => MockWorkbook),
  };
});

describe('ForecastService', () => {
  let service: ForecastService;
  let prismaMock: jest.Mocked<PrismaClient>;
  let excelMock: jest.Mocked<typeof ExcelJS>;
  let loggerMock: jest.Mocked<Logger>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ForecastService],
    }).compile();

    service = moduleRef.get<ForecastService>(ForecastService);

    prismaMock = new PrismaClient() as jest.Mocked<PrismaClient>;
    excelMock = new ExcelJS.Workbook() as unknown as jest.Mocked<typeof ExcelJS>;
    loggerMock = Logger as unknown as jest.Mocked<Logger>;

    service.prisma = prismaMock;
    service.logger = loggerMock;
  });

  describe('getExcelData', () => {
    it('should successfully upsert data', async () => {
      // Mock data
      const buffer = Buffer.from('some excel data');
      const year = 2023;
      const brandId = 1;

      const mockForecastData = { '1': 1000, '2': 2000, '3': 3000 };
      const mockAdBudgetData = { '1': 4000, '2': 5000, '3': 6000 };

      // Mock excel data extraction
      excelMock.xlsx.load = jest.fn().mockResolvedValue(excelMock);
      excelMock.getWorksheet = jest.fn().mockReturnValue({
        getRow: jest.fn().mockReturnValue({
          getCell: jest.fn().mockReturnValue({ value: '1000' }),
        }),
      });

      // Mock prisma upsert
      prismaMock.forecast.upsert = jest.fn().mockResolvedValue({});

      // Run the function
      await service.getExcelData(buffer, year, brandId);

      // Check if ExcelJS methods were called with correct arguments
      expect(excelMock.xlsx.load).toHaveBeenCalledWith(buffer);
      expect(excelMock.getWorksheet).toHaveBeenCalled();

      // Check if PrismaClient methods were called with correct arguments
      Object.entries(mockForecastData).forEach(([month]) => {
        expect(prismaMock.forecast.upsert).toHaveBeenCalledWith({
          where: { month_year: { month: Number(month), year } },
          update: { forecast: mockForecastData[month], adBudget: mockAdBudgetData[month], brandId },
          create: {
            month: Number(month),
            year,
            forecast: mockForecastData[month],
            adBudget: mockAdBudgetData[month],
            brandId,
          },
        });
      });

      // Ensure all operations were done in a transaction
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });
});
