import React, { useEffect, useState } from 'react'

import { SignUpButton, useAuth } from '@clerk/nextjs'
import { Button, rem, Select, Stepper } from '@mantine/core'
import { useRouter } from 'next/router'
import process from 'process'

import Section from '@/components/home/section'
import IconBrandDigitalOcean from '@/components/icons/digital-ocean'
import { PATHS } from '@/constants'
import { useUser } from '@/hooks/use-user'

import styles from './styles.module.scss'

type StepperProps = StepProps & React.RefAttributes<HTMLButtonElement>
type StepProps = {
    initialStep?: number
    children: React.ReactElement<StepperProps> | React.ReactElement<StepperProps>[]
}

const Steps: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0)
    const [isDM, setIsDM] = useState(true)
    const { isSignedIn } = useAuth()
    const { push } = useRouter()
    const { data } = useUser()

    useEffect(() => {
        if (data?.servers.length) setActiveStep(isDM ? 3 : 2)
        else if (isDM && data?.authorized) setActiveStep(2)
        else if (isSignedIn) setActiveStep(1)
    }, [data?.authorized, isSignedIn, data?.servers, isDM])

    return (
        <Section title="Steps to Setup">
            <Select
                defaultValue="dm"
                data={[
                    { value: 'dm', label: 'Dungeon Master' },
                    { value: 'player', label: 'Player' },
                ]}
                onChange={(value) => setIsDM(value === 'dm')}
                mb="2rem"
                w={rem(320)}
                mx="auto"
            />
            <Stepper
                active={activeStep}
                onStepClick={(step) => setActiveStep(step)}
                breakpoint="sm"
                className={styles.stepper}
                maw={!isDM ? '40rem' : undefined}
                m="0 auto"
            >
                <Stepper.Step label="Step 1" description="Create Metalworks Account">
                    <SignUpButton redirectUrl={PATHS.HOME}>
                        <Button radius="xl" size="md">
                            Sign Up
                        </Button>
                    </SignUpButton>
                </Stepper.Step>
                {isDM ? (
                    <Stepper.Step label="Step 2" description="Connect DigitalOcean Account">
                        <Button radius="xl" size="md" component="a" href={process.env.NEXT_PUBLIC_DO_URL}>
                            <IconBrandDigitalOcean size={16} style={{ marginRight: rem(4) }} />
                            Connect DigitalOcean
                        </Button>
                    </Stepper.Step>
                ) : null}
                <Stepper.Step
                    label={isDM ? 'Step 3' : 'Step 2'}
                    description={`${isDM ? 'Create' : 'Join'} Metalworks Server`}
                >
                    <Button radius="xl" size="md" onClick={() => push(`${PATHS.SETUP}?type=${isDM ? 'dm' : 'player'}`)}>
                        {isDM ? 'Create' : 'Join'} Metalworks Server
                    </Button>
                </Stepper.Step>
                <Stepper.Completed>{"Looks like you're a pro already!"}</Stepper.Completed>
            </Stepper>
        </Section>
    )
}

export default Steps
