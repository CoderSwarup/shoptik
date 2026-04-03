export { authService } from './auth.service'
export type { User, LoginInput, RegisterInput } from './auth.service'

export { productsService } from './products.service'
export type { Product, CreateProductInput, UpdateProductInput, Category, ProductQueryParams, ProductsResponse } from './products.service'

export { addressesService } from './addresses.service'
export type { Address, CreateAddressInput, UpdateAddressInput, PincodeValidation } from './addresses.service'

export { ordersService } from './orders.service'
export type { Order, OrderItem, CreateOrderInput } from './orders.service'

export { deliveryZonesService } from './delivery-zones.service'
export type { DeliveryZone, CreateDeliveryZoneInput, UpdateDeliveryZoneInput, DeliveryZonesResponse } from './delivery-zones.service'
