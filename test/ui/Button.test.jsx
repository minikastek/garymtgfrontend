import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { expect, test, vi } from 'vitest'
import Button from '../../src/components/Button'

test('Button is keyboard-operable and has no automated accessibility violations', async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()
  const { container } = render(<Button onClick={onClick}>Guardar cambios</Button>)

  await user.tab()
  expect(screen.getByRole('button', { name: 'Guardar cambios' })).toHaveFocus()

  await user.keyboard('{Enter}')
  expect(onClick).toHaveBeenCalledOnce()

  const results = await axe.run(container, {
    rules: {
      // axe-core documents color-contrast as unsupported in jsdom.
      'color-contrast': { enabled: false },
    },
  })
  expect(results.violations).toEqual([])
})
