import {Auth, Storage, Resources, Service,} from './service'

const Shops = Resources('shops')
const Admins = Resources('admins')
const Products = Resources('products')
const Categories = Resources('categories')
const Customers = Resources('customers')
const PaymentMethods = Resources('payment_methods')
const DeliveryMethods = Resources('delivery_methods')
const Orders = Resources('orders')
const Items = Resources('items')
const Coupons = Resources('coupons')
const Warehouses = Resources('warehouses')
const WarehouseItems = Resources('warehouse_items')
const Movements = Resources('movements')
const Taxes = Resources('taxes')

const Dashboard = {
    index: () => Service.get('/dashboard/index'),
}

export default {
    Auth,
    Storage,
    Shops,
    Admins,
    Products,
    Categories,
    Dashboard,
    Customers,
    PaymentMethods,
    DeliveryMethods,
    Orders,
    Items,
    Coupons,
    Warehouses,
    WarehouseItems,
    Movements,
    Taxes,
}
