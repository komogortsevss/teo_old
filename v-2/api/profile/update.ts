import ProfilesTable from '../../tables/profiles.table'
import { requireRealUser } from '@app/auth'
import { updateUser } from '@app/users'

export const apiProfileUpdateRoute = app.post('/', async (ctx, req) => {
  requireRealUser(ctx)

  const { 
    firstName, 
    lastName, 
    // Домашний адрес
    street, 
    house, 
    apartment, 
    entrance, 
    floor, 
    intercom,
    // Рабочий адрес
    workStreet, 
    workHouse, 
    workApartment, 
    workEntrance, 
    workFloor, 
    workIntercom 
  } = req.body

  if (firstName !== undefined || lastName !== undefined) {
    await updateUser(ctx, ctx.user.id, {
      firstName: firstName ?? ctx.user.firstName,
      lastName: lastName ?? ctx.user.lastName,
    })
  }

  const existing = await ProfilesTable.findOneBy(ctx, { userId: ctx.user.id })

  if (existing) {
    await ProfilesTable.update(ctx, {
      id: existing.id,
      // Домашний адрес
      street: street ?? existing.street,
      house: house ?? existing.house,
      apartment: apartment ?? existing.apartment,
      entrance: entrance ?? existing.entrance,
      floor: floor ?? existing.floor,
      intercom: intercom ?? existing.intercom,
      // Рабочий адрес
      workStreet: workStreet ?? existing.workStreet,
      workHouse: workHouse ?? existing.workHouse,
      workApartment: workApartment ?? existing.workApartment,
      workEntrance: workEntrance ?? existing.workEntrance,
      workFloor: workFloor ?? existing.workFloor,
      workIntercom: workIntercom ?? existing.workIntercom,
    })
  } else {
    await ProfilesTable.create(ctx, {
      userId: ctx.user.id,
      // Домашний адрес
      street: street || '',
      house: house || '',
      apartment: apartment || '',
      entrance: entrance || '',
      floor: floor || '',
      intercom: intercom || '',
      // Рабочий адрес
      workStreet: workStreet || '',
      workHouse: workHouse || '',
      workApartment: workApartment || '',
      workEntrance: workEntrance || '',
      workFloor: workFloor || '',
      workIntercom: workIntercom || '',
    })
  }

  return { success: true }
})
