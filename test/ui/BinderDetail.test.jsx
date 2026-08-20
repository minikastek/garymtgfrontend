import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { getBinder, updateBinder } from '../../src/api'
import BinderDetail from '../../src/pages/BinderDetail'

vi.mock('../../src/api', () => ({
  addCardToBinder: vi.fn(),
  deleteBinder: vi.fn(),
  getBinder: vi.fn(),
  updateBinder: vi.fn(),
}))

vi.mock('../../src/components/CardSearch', () => ({
  default: () => <div>Buscar cartas</div>,
}))

function renderBinderDetail() {
  return render(
    <MemoryRouter initialEntries={['/binders/binder-1']}>
      <Routes>
        <Route path="/binders/:id" element={<BinderDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  getBinder.mockResolvedValue({
    binder: {
      id: 'binder-1',
      name: 'Cambios',
      description: 'Cartas disponibles',
      tradeEnabled: false,
      cards: [],
    },
  })
})

afterEach(cleanup)

test('saves explicit trade availability and adopts the confirmed response', async () => {
  const user = userEvent.setup()
  updateBinder.mockResolvedValue({
    binder: {
      id: 'binder-1',
      name: 'Cambios',
      description: 'Cartas disponibles',
      tradeEnabled: true,
      cards: [],
    },
  })
  renderBinderDetail()

  const sharingControl = await screen.findByRole('checkbox', { name: /disponible para intercambios/i })
  expect(sharingControl).not.toBeChecked()

  await user.click(sharingControl)
  await user.click(screen.getByRole('button', { name: 'Guardar datos' }))

  expect(updateBinder).toHaveBeenCalledWith('binder-1', {
    name: 'Cambios',
    description: 'Cartas disponibles',
    tradeEnabled: true,
  })
  expect(sharingControl).toBeChecked()
  expect(screen.getByRole('status')).toHaveTextContent('Datos del binder guardados.')
})

test('restores the last confirmed trade availability when saving fails', async () => {
  const user = userEvent.setup()
  updateBinder.mockRejectedValue(new Error('No se pudo guardar.'))
  renderBinderDetail()

  const sharingControl = await screen.findByRole('checkbox', { name: /disponible para intercambios/i })
  await user.click(sharingControl)
  await user.click(screen.getByRole('button', { name: 'Guardar datos' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('No se aplicaron cambios.')
  await waitFor(() => expect(sharingControl).not.toBeChecked())
})
