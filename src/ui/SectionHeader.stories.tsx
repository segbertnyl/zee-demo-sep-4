import type { Meta, StoryObj } from '@storybook/react'
import { SectionHeader } from './SectionHeader'

export default {
  title: 'UI / SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'radio', options: ['primary', 'secondary'] },
    heading: { control: 'text' },
    body: { control: 'text' },
    showNyla: { control: 'boolean' },
    className: { control: 'text' },
  },
} satisfies Meta<typeof SectionHeader>

type Story = StoryObj<typeof SectionHeader>

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    heading: 'Where do you want your practice to head in the next two to three years?',
    body: 'Select up to 3.',
  },
}

export const SecondaryBodyOnly: Story = {
  args: {
    variant: 'secondary',
    heading: 'Where do you want your practice to head in the next two to three years?',
  },
}

export const Primary: Story = {
  args: {
    variant: 'primary',
    showNyla: true,
    heading: "You've got goals. Now let's build around how you actually work.",
    body: 'The best plan fits your practice, not a template...',
  },
}

export const PrimarySequenced: Story = {
  name: 'Primary — orb sequence',
  args: {
    variant: 'primary',
    animated: true,
    nylaSequence: true,
    showNyla: true,
    heading: "You've got goals. Now let's build around how you actually work.",
    body: 'The best plan fits your practice, not a template...',
  },
}

export const PrimaryNoNyla: Story = {
  args: {
    variant: 'primary',
    showNyla: false,
    heading: "You've got goals. Now let's build around how you actually work.",
    body: 'The best plan fits your practice, not a template...',
  },
}

const label = (text: string) => (
  <p
    style={{
      fontFamily: 'var(--font-sans)',
      fontSize: 10.5,
      fontWeight: 500,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: 'var(--text-body-muted)',
      marginBottom: 8,
      marginTop: 0,
    }}
  >
    {text}
  </p>
)

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48, padding: 32 }}>
      {label('Secondary — heading + body')}
      <SectionHeader
        variant="secondary"
        heading="Where do you want your practice to head in the next two to three years?"
        body="Select up to 3."
      />

      {label('Secondary — heading only')}
      <SectionHeader
        variant="secondary"
        heading="Where do you want your practice to head in the next two to three years?"
      />

      {label('Primary — with Nyla')}
      <SectionHeader
        variant="primary"
        showNyla={true}
        heading="You've got goals. Now let's build around how you actually work."
        body="The best plan fits your practice, not a template..."
      />

      {label('Primary — no Nyla')}
      <SectionHeader
        variant="primary"
        showNyla={false}
        heading="You've got goals. Now let's build around how you actually work."
        body="The best plan fits your practice, not a template..."
      />
    </div>
  ),
}
