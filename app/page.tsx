'use client'
import { useForm } from '@mantine/form'
import { useEffect, useState } from 'react'
import { useLocalStorage } from '@mantine/hooks'
import { IconAlertTriangleFilled } from '@tabler/icons-react'
import { Alert, Button, Card, Center, Flex, Group, LoadingOverlay, TextInput, Title } from '@mantine/core'
import { useGetVersion } from './hooks'
import CollectionSidebar from './components/CollectionSidebar'
import CollectionRecords from './components/CollectionRecords'

export default function HomePage() {
  const [value, setValue] = useLocalStorage({ key: 'url' })
  const [localURL, setLocalURL] = useState<string | undefined>()
  const { data, isLoading, refetch, error } = useGetVersion(localURL)

  useEffect(() => {
    if (data && localURL) {
      setValue(localURL)
    }
  }, [data, localURL, setValue])

  const form = useForm({
    initialValues: {
      url: '',
    },
    validate: {
      url: (value) => (/(https?:\/\/.*):(\d*)\/?(.*)/.test(value) ? null : 'Invalid URL'),
    },
  })

  useEffect(() => {
    if (error) {
      form.setFieldError('url', ' ')
    }
  }, [error])

  if (value) {
    return (
      <Flex
        h="100vh"
        direction="row">
        <CollectionSidebar />
        <CollectionRecords />
      </Flex>
    )
  } else {
    return (
      <Center h="100vh">
        <Card shadow="md" padding="xl" radius="md" w="40%" withBorder>
          <Title order={1}>New Connection</Title>
          <br />
          <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
          <form style={{ minWidth: "260px" }} autoComplete="off" onSubmit={form.onSubmit((values) => {
            setLocalURL(previous => {
              if (previous) {
                refetch()
              }
              return values.url
            })
          })}>
            <TextInput
              withAsterisk
              label="Connection URL"
              placeholder="http://127.0.0.1:8000"
              {...form.getInputProps('url')}
            />
            {error && <Alert mt={16} variant="light" color="red" title={error?.message} icon={<IconAlertTriangleFilled />} />}
            <Group justify="flex-end" mt="md">
              <Button type="submit">Connect</Button>
            </Group>
          </form>
        </Card>
      </Center>
    )
  }
}
