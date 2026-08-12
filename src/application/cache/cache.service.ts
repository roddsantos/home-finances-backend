import {
  CachedBanks,
  CachedBills,
  CachedCategories,
  CachedCompanies,
  CachedCreditCards,
  CachedDashboard,
  CachedHome,
  CachedSettings,
  CacheGeneralType,
  CacheSectionsType,
  CacheUser
} from '../core/types/cache'
import { isInsideDateDelta } from '../utils/dates'
import { GeneralService } from '../app/general/service.general'
import * as path from 'path'
import { CACHE_MODULE } from '../core/consts/filename.consts'
import { ErrorHandler } from '../utils/ErrorHandler'

export class CacheService extends GeneralService {
  private readonly instanceId = Math.random().toString(36).substring(2, 8)
  private cache: Record<CacheSectionsType, CacheUser> = {
    banks: {},
    creditCards: {},
    companies: {},
    categories: {},
    bills: {},
    settings: {},
    dashboard: {},
    home: {}
  }

  private ttl: number = 60 * 60 * 24 * 1000 * 5

  constructor() {
    super(path.join(__dirname, CACHE_MODULE.service))
    this.logger.log(`cache created : instanceId : ${this.instanceId}`, this.logDirectory)
  }

  private _getExpirationDate() {
    return new Date(Date.now() + this.ttl)
  }

  private _getCache(section: string, key: string): CacheGeneralType<unknown> | null {
    const sectionData: CacheGeneralType = this.cache[section][key]

    if (!sectionData) return null

    if (!isInsideDateDelta(sectionData.expiresAt)) {
      delete this.cache[section][key]
      return null
    }

    return sectionData
  }

  private _setCache<T>(section: CacheSectionsType, key: string, data: T) {
    this.cache[section][key] = {
      expiresAt: this._getExpirationDate(),
      data
    }
    this.logger.log(
      `cache saved : section : ${section.toUpperCase()} : key : ${key}`,
      this.logDirectory
    )
  }

  public getCachedBanks(key: string) {
    return this._getCache('banks', key)
  }

  public setCachedBanks(key: string, data: CachedBanks['data']): void {
    this._setCache('banks', key, data)
  }

  public getCachedCreditCards(key: string) {
    return this._getCache('creditCards', key)
  }

  public setCachedCreditCards(key: string, data: CachedCreditCards['data']): void {
    this._setCache('creditCards', key, data)
  }

  public getCachedCompanies(key: string) {
    return this._getCache('companies', key)
  }

  public setCachedCompanies(key: string, data: CachedCompanies['data']): void {
    this._setCache('companies', key, data)
  }

  public getCachedCategories(key: string) {
    return this._getCache('categories', key)
  }

  public setCachedCategories(key: string, data: CachedCategories['data']): void {
    this._setCache('categories', key, data)
  }

  public getCachedBills(key: string) {
    return this._getCache('bills', key)
  }

  public setCachedBills(key: string, data: CachedBills['data']): void {
    this._setCache('bills', key, data)
  }

  public getCachedSettings(key: string) {
    return this._getCache('settings', key)
  }

  public setCachedSettings(key: string, data: CachedSettings['data']): void {
    this._setCache('settings', key, data)
  }

  public getCachedDashboard(key: string) {
    return this._getCache('dashboard', key)
  }

  public setCachedDashboard(key: string, data: CachedDashboard['data']): void {
    this._setCache('dashboard', key, data)
  }

  public getCachedHome(key: string) {
    return this._getCache('home', key)
  }

  public setCachedHome(key: string, data: CachedHome['data']): void {
    this._setCache('home', key, data)
  }

  public deleteCacheByKey(key: string): void {
    Object.values(this.cache).forEach((cache) => {
      delete cache[key]
    })
  }

  public deleteCacheBySectionAndKey(section: CacheSectionsType, key: string): void {
    delete this.cache[section][key]
    this.logger.log(
      `cache deleted : section : ${section} : key : ${key}`,
      this.logDirectory
    )
  }

  public clearCache(): void {
    Object.keys(this.cache).forEach((section) => {
      this.cache[section as CacheSectionsType] = {}
    })
  }

  public cacheResponse(section: CacheSectionsType, key: string) {
    try {
      const cacheData = this._getCache(section, key)
      if (cacheData) {
        this.logger.log(
          `cache hit : section : ${section.toUpperCase()} : key : ${key}`,
          this.logDirectory
        )
        return cacheData.data
      } else {
        this.logger.log(
          `cache missed - proceed to database query : section : ${section.toUpperCase()} : key : ${key}`,
          this.logDirectory
        )
      }
    } catch (error) {
      this.logger.error(
        `error fetching cache : section : ${section} : key : ${key} : error : ${error}`,
        this.logDirectory
      )
      throw ErrorHandler.INTERNAL_SERVER_ERROR(
        `cache - error fetching cache : section : ${section} : key : ${key}`
      )
    }
  }
}
