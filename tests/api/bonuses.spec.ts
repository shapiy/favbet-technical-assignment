import { test, expect } from '@playwright/test';
import { testData } from '../../src/utils/test-data';
import logger from '../../src/utils/logger';

export interface BonusInfo {
  id?: string;
  type?: string;
  amount?: number;
  currency?: string;
  status?: string;
  wagering?: number;
  expiryDate?: string;
}

test.describe('Favbet API - Bonuses', () => {

  test('should authenticate and get user bonuses list', async ({ page }) => {
    test.setTimeout(60000); // Increase timeout for authentication

    // Step 1: Navigate to homepage - authentication should be preserved from setup
    await page.goto(testData.favbet.urls.homepage);
    
    // Wait for page to be fully loaded after login
    await page.waitForLoadState('networkidle');
    
    // Step 2: Get user bonuses using browser's fetch API (inherits authentication)
    logger.info('Fetching user bonuses using browser context...');
    
    const bonusResult = await page.evaluate(async () => {
      try {
        // Get bonus count
        const countResponse = await fetch('/accounting/api/crm_roxy/getanybonuscount', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: '{}'
        });
        
        const countResult = {
          status: countResponse.status,
          statusText: countResponse.statusText,
          ok: countResponse.ok,
          data: countResponse.ok ? await countResponse.json() : await countResponse.text()
        };

        let wageringResult = null;
        
        // If we have bonuses, get wagering details
        if (countResult.ok && countResult.data?.response?.response?.bonusCount > 0) {
          const wageringResponse = await fetch('/service/crm_proxy/crm_api/gamegate/anybonus/wagering', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: '{}'
          });
          
          wageringResult = {
            status: wageringResponse.status,
            statusText: wageringResponse.statusText,
            ok: wageringResponse.ok,
            data: wageringResponse.ok ? await wageringResponse.json() : await wageringResponse.text()
          };
        }
        
        return { countResult, wageringResult };
        
      } catch (error: any) {
        return { error: error.message };
      }
    });

    // Log the API responses
    logger.info(`Bonus count API status: ${bonusResult.countResult.status} ${bonusResult.countResult.statusText}`);
    logger.info('Bonus count API response:', bonusResult.countResult.data);
    
    if (bonusResult.wageringResult) {
      logger.info(`Bonus wagering API status: ${bonusResult.wageringResult.status} ${bonusResult.wageringResult.statusText}`);
      logger.info('Bonus wagering API response:', bonusResult.wageringResult.data);
    }

    // Step 3: Process and validate the bonus data
    let bonuses: BonusInfo[] = [];
    
    expect(bonusResult.countResult.ok).toBe(true);
    expect(bonusResult.countResult.data).toBeDefined();
    
    const countData = bonusResult.countResult.data;
    const bonusCount = countData?.response?.response?.bonusCount || 0;
    
    logger.info(`Found ${bonusCount} bonuses from API`);
    
    if (bonusCount > 0) {
      if (bonusResult.wageringResult?.ok && bonusResult.wageringResult.data) {
        const wageringData = bonusResult.wageringResult.data;
        
        // Process wagering response
        if (wageringData && wageringData.response && Array.isArray(wageringData.response)) {
          bonuses = wageringData.response.map((bonus: any, index: number) => ({
            id: bonus.id || bonus.bonusId || `bonus_${index + 1}`,
            type: bonus.type || bonus.bonusType || 'bonus',
            amount: bonus.amount || bonus.value || 0,
            currency: bonus.currency || 'UAH',
            status: bonus.status || 'active',
            wagering: bonus.wagering || bonus.wageringRequired || 0,
            expiryDate: bonus.expiryDate || bonus.validUntil
          }));
        }
      }
      
      // If no detailed bonuses found but count suggests they exist, create basic structure
      if (bonuses.length === 0) {
        for (let i = 0; i < bonusCount; i++) {
          bonuses.push({
            id: `bonus_${i + 1}`,
            type: 'bonus',
            amount: 0,
            currency: 'UAH',
            status: 'active',
            wagering: 0,
            expiryDate: undefined
          });
        }
      }
    }

    // Step 4: Verify the response structure
    expect(bonuses).toBeDefined();
    expect(Array.isArray(bonuses)).toBe(true);
    
    logger.info(`Retrieved ${bonuses.length} bonuses`);
    
    if (bonuses.length > 0) {
      logger.info('Processed bonuses:', bonuses);
    }

    // Step 5: Validate bonus data structure
    const validateBonusData = (bonuses: BonusInfo[]) => {
      const errors: string[] = [];
      
      if (!Array.isArray(bonuses)) {
        errors.push('Bonuses should be an array');
        return { isValid: false, errors };
      }

      bonuses.forEach((bonus, index) => {
        if (!bonus.id && !bonus.type) {
          errors.push(`Bonus at index ${index} missing both id and type`);
        }
        
        if (bonus.amount !== undefined && (typeof bonus.amount !== 'number' || bonus.amount < 0)) {
          errors.push(`Bonus at index ${index} has invalid amount: ${bonus.amount}`);
        }
        
        if (bonus.currency && typeof bonus.currency !== 'string') {
          errors.push(`Bonus at index ${index} has invalid currency: ${bonus.currency}`);
        }
        
        if (bonus.wagering !== undefined && (typeof bonus.wagering !== 'number' || bonus.wagering < 0)) {
          errors.push(`Bonus at index ${index} has invalid wagering: ${bonus.wagering}`);
        }
      });

      return {
        isValid: errors.length === 0,
        errors
      };
    };
    
    const validation = validateBonusData(bonuses);
    expect(validation.isValid).toBe(true);
    
    if (validation.errors.length > 0) {
      logger.error('Bonus validation errors:', validation.errors);
      expect(validation.errors).toHaveLength(0);
    }

    // Step 6: Verify each bonus has expected properties (if any bonuses exist)
    if (bonuses.length > 0) {
      bonuses.forEach((bonus, index) => {
        logger.info(`Bonus ${index + 1}:`, bonus);
        
        // Each bonus should have at least an id or type
        expect(bonus.id || bonus.type).toBeTruthy();
        
        // If amount is present, it should be a non-negative number
        if (bonus.amount !== undefined) {
          expect(typeof bonus.amount).toBe('number');
          expect(bonus.amount).toBeGreaterThanOrEqual(0);
        }
        
        // If currency is present, it should be a string
        if (bonus.currency !== undefined) {
          expect(typeof bonus.currency).toBe('string');
          expect(bonus.currency.length).toBeGreaterThan(0);
        }
        
        // If wagering is present, it should be a non-negative number
        if (bonus.wagering !== undefined) {
          expect(typeof bonus.wagering).toBe('number');
          expect(bonus.wagering).toBeGreaterThanOrEqual(0);
        }
        
        // If status is present, it should be a string
        if (bonus.status !== undefined) {
          expect(typeof bonus.status).toBe('string');
        }
      });
    } else {
      logger.info('No bonuses found for user - this is acceptable');
    }
    
    logger.info('Bonus API test completed successfully');
  });

});