import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { PercentLoader } from './PercentLoader'

export default {
  title: 'UI / PercentLoader',
  component: PercentLoader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
} satisfies Meta<typeof PercentLoader>

type Story = StoryObj<typeof PercentLoader>

export const Empty: Story = { args: { value: 0 } }
export const Quarter: Story = { args: { value: 25 } }
export const Half: Story = { args: { value: 50 } }
export const ThreeQuarter: Story = { args: { value: 75 } }
export const Full: Story = { args: { value: 100 } }

function AnimatedLoader() {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => {
        if (v >= 100) { clearInterval(id); return 100 }
        return v + 1
      })
    }, 40)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="flex items-center gap-3">
      <PercentLoader value={value} />
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-body-muted)' }}>
        {value}%
      </span>
    </div>
  )
}

export const Animated: Story = {
  parameters: { controls: { disable: true } },
  render: () => <AnimatedLoader />,
}
