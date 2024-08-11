'use client'
import { useForm } from '@mantine/form'
import { FormEvent, useEffect, useState } from 'react'
import { useLocalStorage } from '@mantine/hooks'
import { IconAlertTriangleFilled, IconBrandGithub } from '@tabler/icons-react'
import { Alert, Box, Button, Card, Center, Flex, Group, LoadingOverlay, TextInput, Title } from '@mantine/core'
import { useGetVersion } from './hooks'
import CollectionSidebar from './components/CollectionSidebar'
import CollectionRecords from './components/CollectionRecords'
import Link from 'next/link'

export default function HomePage() {
  const [url, setURL] = useLocalStorage({ key: 'url' })
  const [tenant, setTenant] = useLocalStorage({ key: 'tenant' })
  const [dbname, setDbName] = useLocalStorage({ key: 'dbname' })

  const { data, isLoading, refetch, error } = useGetVersion(url)

  const form = useForm({
    initialValues: {
      url: 'http://127.0.0.1:8000',
      tenant: 'default_tenant',
      dbname: 'default_database'
    },
    validate: {
      url: (value) => (/(https?:\/\/.*):(\d*)\/?(.*)/.test(value) ? null : 'Invalid URL'),
      tenant: value => !!value ? null : 'Invalid value',
      dbname: value => !!value ? null : 'Invalid value',
    },
  })

  useEffect(() => {
    if(url && tenant && dbname)
      form.setValues({ url, tenant, dbname, })
  },[ url, tenant, dbname ])

  useEffect(() => { url && refetch() },[ url ])

  const [ submitted, setSubmitted ] = useState(false)
  function onSubmit(){
    return form.onSubmit((values) => {
      setSubmitted(true)
      setURL(values.url)
      setTenant(values.tenant)
      setDbName(values.dbname)
    })
  }

  const [ ok, setOk ] = useState(false)
  useEffect(() => {
    setOk(submitted && data && !isLoading)
  },[ data, isLoading, submitted ])

  if (ok) {
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
      <Box>
        <Card shadow="sm" withBorder style={{ position: "fixed", top: 0, width: "100%" }}>
          <Group gap={8} style={{ display: "flex", justifyContent: "space-between" }}>
            <Box><Title order={3}>Chroma DB UI</Title></Box>
            <Box>
              <Button variant="default" component={Link} href={"https://github.com/thakkaryash94/chroma-ui"} target="_blank">
                GitHub
              </Button>
            </Box>
          </Group>
        </Card>
        <Center h="100vh">
          <Card shadow="md" padding="xl" radius="md" w="40%" withBorder>
            <Title order={1}>New Connection</Title>
            <br />
            <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <form style={{ minWidth: "260px" }} autoComplete="off" onSubmit={onSubmit()}>
              <TextInput
                withAsterisk
                label="Connection URL"
                placeholder="http://127.0.0.1:8000"
                {...form.getInputProps('url')}
              />
              <br />
              <TextInput
                withAsterisk
                label="Tenant"
                placeholder="default_tenant"
                {...form.getInputProps('tenant')}
              />
              <br />
              <TextInput
                withAsterisk
                label="DB Name"
                placeholder="default_database"
                {...form.getInputProps('dbname')}
              />
              {error && <Alert mt={16} variant="light" color="red" title={error?.message} icon={<IconAlertTriangleFilled />} />}
              <Group justify="flex-end" mt="md">
                <Button type="submit">Connect</Button>
              </Group>
            </form>
          </Card>
        </Center>
      </Box>
    )
  }
}
