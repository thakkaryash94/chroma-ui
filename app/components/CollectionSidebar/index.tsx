import { useState } from 'react'
import Link from 'next/link'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDisclosure, useLocalStorage } from '@mantine/hooks'
import { IconPlugConnectedX, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react'
import { Group, Code, Button, Modal, TextInput, Tooltip, ActionIcon, NavLink, Text } from '@mantine/core'
import { useAddCollection, useDeleteCollection, useGetCollections } from '../../hooks'
import classes from './index.module.css'

type Collection = {
  id: string
  name: string
  metadata?: any
}

export default function Navbar() {
  const [createCollectionOpened, { open: createCollectionOpen, close: createCollectionClose }] = useDisclosure(false)
  const [deleteCollectionOpened, { open: deleteCollectionOpen, close: deleteCollectionClose }] = useDisclosure(false)
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null)
  const router = useRouter()
  const search = useSearchParams()
  const collectionId = search.get("collection-id")
  const [url, setURL, removeURL] = useLocalStorage({ key: 'url' })
  const [tenant, setTenant, removeTenant] = useLocalStorage({ key: 'tenant' })
  const [dbname, setDbName, removeDbName] = useLocalStorage({ key: 'dbname' })

  const form = useForm({
    initialValues: {
      name: ""
    },
    validate: {
      name: (value) => (/^(?!.*\.\.)[a-zA-Z0-9](?:[a-zA-Z0-9_-]{1,61}[a-zA-Z0-9])?$/.test(value) ? null : "Expected collection name that (1) contains 3-63 characters, (2) starts and ends with an alphanumeric character, (3) otherwise contains only alphanumeric characters, underscores or hyphens (-), (4) contains no two consecutive periods (..) and (5) is not a valid IPv4 address"),
    },
  })
  const { isPending, error, data, refetch } = useGetCollections()
  const { mutateAsync: addCollectionMutationAsync } = useAddCollection()

  const { mutateAsync: deleteCollectionMutationAsync } = useDeleteCollection()

  if (isPending) return 'Loading...'

  if (error) return 'An error has occurred: ' + error.message

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          Logo
          <Code fw={700}>v0.0.1</Code>
        </Group>
        <Group gap={4}>
          <Tooltip label="Create Collection">
            <ActionIcon onClick={createCollectionOpen}>
              <IconPlus />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Refresh">
            <ActionIcon onClick={() => { refetch() }}>
              <IconRefresh />
            </ActionIcon>
          </Tooltip>
        </Group>
        <br />
        {data && Array.isArray(data) && data.map((collection: Collection) => (
          <NavLink
            key={collection.id}
            active={collection.id === collectionId}
            label={collection.name}
            component={Link}
            href={`?collection-id=${collection.id}`}
            rightSection={<Tooltip label="Delete">
              <ActionIcon variant="subtle" size="xs" color="rgba(255, 71, 71, 1)" onClick={(e) => {
                e.preventDefault()
                setDeleteCollectionId(collection.name)
                deleteCollectionOpen()
              }}><IconTrash />
              </ActionIcon>
            </Tooltip>}
          />
        ))}
      </div>
      <div className={classes.footer}>
        <Button variant="subtle" fullWidth leftSection={<IconPlugConnectedX />} onClick={() => {
          removeURL()
          removeTenant()
          removeDbName()
          router.push("/")
        }}>Disconnect</Button>
      </div>
      <Modal opened={deleteCollectionOpened} onClose={deleteCollectionClose} title={<span style={{ fontWeight: 700 }}>Delete Collection</span>} centered>
        Are you sure, you want to delete this collection?
        <Group justify="flex-end" mt="md">
          <Button color="gray" variant='subtle' onClick={deleteCollectionClose}>No</Button>
          <Button color="red" onClick={() => {
            if (deleteCollectionId) {
              deleteCollectionMutationAsync(deleteCollectionId).then(() => {
                notifications.show({
                  color: "green",
                  title: "Success",
                  message: "Collection deleted",
                })
                router.push('/')
                deleteCollectionClose()
              }).catch((err) => {
                notifications.show({
                  color: "red",
                  title: "Error",
                  message: err.detail[0].msg
                })
              })
            }
          }}>Yes</Button>
        </Group>
      </Modal>
      <Modal opened={createCollectionOpened} onClose={createCollectionClose} title={<Text fw={700} size='xl'>Create Collection</Text>} centered>
        <form onSubmit={form.onSubmit((values) => {
          addCollectionMutationAsync(values).then(() => {
            notifications.show({
              color: "green",
              title: "Success",
              message: "Collection created",
            })
            createCollectionClose()
          }).catch((err) => {
            notifications.show({
              color: "red",
              title: "Error",
              message: err.detail[0].msg
            })
          })
        })}>
          <TextInput withAsterisk label="Name" {...form.getInputProps("name")} />
          <Group justify="flex-end" mt="md">
            <Button color="gray" variant='subtle' onClick={createCollectionClose}>Cancel</Button>
            <Button type="submit">Add</Button>
          </Group>
        </form>
      </Modal>
    </nav>
  )
}
