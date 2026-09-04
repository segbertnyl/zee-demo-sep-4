import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './Textarea'

const meta: Meta<typeof Textarea> = {
  title: 'UI / Textarea',
  component: Textarea,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof Textarea>

export const Empty: Story = {
  args: {
    placeholder: 'Describe in your own words...',
  },
}

export const WithValue: Story = {
  args: {
    value:
      'My close rate dropped because we lost two large pending cases in Q3.',
  },
}

export const WithTags: Story = {
  args: {
    placeholder: 'Describe in your own words...',
    tags: ['Poor lead quality lately', 'Uncompetitive pricing', 'This is news to me'],
    onMicClick: () => {},
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
      <div>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: 'var(--text-body-muted)',
            marginBottom: '8px',
            marginTop: 0,
          }}
        >
          Empty
        </p>
        <Textarea placeholder="Describe in your own words..." />
      </div>
      <div>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: 'var(--text-body-muted)',
            marginBottom: '8px',
            marginTop: 0,
          }}
        >
          With Tags
        </p>
        <Textarea
          placeholder="Describe in your own words..."
          tags={['Poor lead quality lately', 'Uncompetitive pricing', 'This is news to me']}
          onMicClick={() => {}}
        />
      </div>
    </div>
  ),
}
