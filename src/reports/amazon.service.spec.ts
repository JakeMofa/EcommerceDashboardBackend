import { Test, TestingModule } from '@nestjs/testing';
import { AmazonService } from './amazon.service';
import { HttpModule } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

describe('AmazonService', () => {
  let service: AmazonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [AmazonService],
    }).compile();

    service = module.get<AmazonService>(AmazonService);
  });

  it('should store Ads Credentials properly', async () => {
    jest.spyOn(service, 'exchangeCodeForToken').mockImplementation(() => Promise.resolve({ access_token: '123' }));
    jest
      .spyOn(service, 'fetchBrandCredentials')
      .mockImplementation(() =>
        Promise.resolve([{ credential_details: JSON.stringify({ selling_partner_id: '123' }) }]),
      );
    jest
      .spyOn(service, 'fetchProfiles')
      .mockImplementation(() => Promise.resolve({ data: [] }) as Promise<AxiosResponse<unknown, any>>);
    jest.spyOn(service, 'fetchBrand').mockImplementation(() => Promise.resolve({ db_name: 'myDB' }));
    jest.spyOn(service.brandDB, 'reconnect').mockImplementation(() => Promise.resolve());
    jest.spyOn(service, 'getMatchedProfiles').mockImplementation(() => Promise.resolve([]));
    jest.spyOn(service, 'storeOrUpdateProfile').mockImplementation(() => {
      return Promise.resolve({
        id: 1,
        app_id: null,
        app_type: null,
        credential_type: null,
        credential_details: null,
        marketplace: null,
        marketplace_id: null,
        status: null,
        created_at: null,
        updated_at: null,
      });
    });
    const result = await service.storeAdsCredential({ code: '123', state: '1' });

    expect(result).toEqual('1');
    expect(service.exchangeCodeForToken).toBeCalledWith({ code: '123', ads: true });
    expect(service.fetchBrandCredentials).toBeCalled();
    expect(service.fetchProfiles).toBeCalledWith({ access_token: '123' });
    expect(service.fetchBrand).toBeCalledWith(service.commerceDB, '1');
    expect(service.brandDB.reconnect).toBeCalledWith('myDB');
    expect(service.getMatchedProfiles).toBeCalled();
    expect(service.storeOrUpdateProfile).toBeCalled();
  });
});
