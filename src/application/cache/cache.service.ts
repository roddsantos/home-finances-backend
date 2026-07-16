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
  CacheUser
} from '../core/types/cache'
import { isInsideDateDelta } from '../utils/dates'

export class CacheService {
  private cachedBanks: CacheUser<CachedBanks>
  private cachedCreditCards: CacheUser<CachedCreditCards>
  private cachedCompanies: CacheUser<CachedCompanies>
  private cachedCategories: CacheUser<CachedCategories>
  private cachedBills: CacheUser<CachedBills>
  private cachedSettings: CacheUser<CachedSettings>
  private cachedDashboard: CacheUser<CachedDashboard>
  private cachedHome: CacheUser<CachedHome>

  private ttl: number = 60 * 60 * 24 * 1000

  constructor() {}

  private _getExpirationDate() {
    const nowDateMilli = new Date().getTime()
    const newDateMilli = nowDateMilli + this.ttl
    return new Date(newDateMilli)
  }

  private _getCache<T>(key: string, caches: CacheUser<T>): CacheGeneralType<T> | null {
    const cache = caches[key]

    if (!cache) return null

    if (!isInsideDateDelta(cache.expiresAt, this.ttl)) {
      delete caches[key]
      return null
    }

    return cache
  }

  private _setCache<T>(key: string, cache: CacheUser<T>, data: any) {
    cache[key] = {
      expiresAt: new Date(Date.now() + this.ttl),
      data
    }
  }

  public getCachedBanks(key: string) {
    return this._getCache(key, this.cachedBanks)
  }

  public setCachedBanks(key: string, data: CachedBanks['data']) {
    this._setCache<CachedBanks>(key, this.cachedBanks, data)
  }

  public getCachedCreditCards(key: string) {
    return this._getCache(key, this.cachedCreditCards)
  }

  public setCachedCreditCards(key: string, data: CachedCreditCards['data']) {
    this._setCache<CachedCreditCards>(key, this.cachedCreditCards, data)
  }

  public getCachedCompanies(key: string) {
    return this._getCache(key, this.cachedCompanies)
  }

  public setCachedCompanies(key: string, data: CachedCompanies['data']) {
    this._setCache<CachedCompanies>(key, this.cachedCompanies, data)
  }

  public getCachedCategories(key: string) {
    return this._getCache(key, this.cachedCategories)
  }

  public setCachedCategories(key: string, data: CachedCategories['data']) {
    this._setCache<CachedCompanies>(key, this.cachedCategories, data)
  }

  public getCachedBills(key: string) {
    return this._getCache(key, this.cachedBills)
  }

  public setCachedBills(key: string, data: CachedBills['data']) {
    this._setCache<CachedBills>(key, this.cachedBills, data)
  }

  public getCachedSettings(key: string) {
    return this._getCache(key, this.cachedSettings)
  }

  public setCachedSettings(key: string, data: CachedSettings['data']) {
    this._setCache<CachedSettings>(key, this.cachedSettings, data)
  }

  public getCachedDashboard(key: string) {
    return this._getCache(key, this.cachedDashboard)
  }

  public setCachedDashboard(key: string, data: CachedDashboard['data']) {
    this._setCache<CachedDashboard>(key, this.cachedDashboard, data)
  }

  public getCachedHome(key: string) {
    return this._getCache(key, this.cachedHome)
  }

  public setCachedHome(key: string, data: CachedHome['data']) {
    this._setCache<CachedHome>(key, this.cachedHome, data)
  }

  public deleteCacheByKey(key: string) {
    delete this.cachedBanks[key]
    delete this.cachedCreditCards[key]
    delete this.cachedBills[key]
    delete this.cachedCategories[key]
    delete this.cachedCompanies[key]
    delete this.cachedDashboard[key]
    delete this.cachedHome[key]
    delete this.cachedSettings[key]
  }

  public clearCache() {
    this.cachedBanks = {}
    this.cachedCreditCards = {}
    this.cachedBills = {}
    this.cachedCategories = {}
    this.cachedCompanies = {}
    this.cachedDashboard = {}
    this.cachedHome = {}
    this.cachedSettings = {}
  }
}
