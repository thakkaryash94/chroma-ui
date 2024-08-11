'use client'
import Link from "next/link"
import { useState } from "react"
import { useForm } from "@mantine/form"
import { modals } from "@mantine/modals"
import { useDisclosure } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { useRouter, useSearchParams } from "next/navigation"
import { IconEdit, IconRefresh, IconTablePlus, IconTableShortcut, IconTrash } from "@tabler/icons-react"
import { ActionIcon, Box, Button, Center, Code, Flex, Group, Modal, Pagination, Select, Table, Text, TextInput, Textarea, Tooltip, rem } from "@mantine/core"
import { useAddRecord, useGetRecordsCount, useGetRecords, useUpdateRecord, useDeleteRecord, useGetTableVersion } from "../../hooks"
import { isValidJSON, validateRequired } from "../../utils"

type Record = {
  id: string
  document: string | null
  metadata: string | null
}

export default function CollectionRecords() {
  const search = useSearchParams()
  const router = useRouter()

  const [viewRecordOpened, { open: viewRecordOpen, close: viewRecordClose }] = useDisclosure(false)
  const [addRecordOpened, { open: addRecordOpen, close: addRecordClose }] = useDisclosure(false)
  const [updateRecordOpened, { open: updateRecordOpen, close: updateRecordClose }] = useDisclosure(false)

  const [recordViewItem, setRecordViewItem] = useState<Record | null>(null)
  const collectionId = search.get("collection-id")
  const page = Number.parseInt(search.get("page") || '1')
  const limit = search.get("limit") || '20'

  const addForm = useForm<Record>({
    initialValues: {
      id: '',
      document: '',
      metadata: ''
    },
    validate: {
      id: (value) => validateRequired(value) ? null : 'ID is Required',
      metadata: (value) => {
        if (value) {
          if (isValidJSON(value)) {
            return null
          } else {
            return 'Invalid Metadata'
          }
        } else {
          return null
        }
      }
    }
  })
  const updateForm = useForm<Record>({
    validate: {
      metadata: (value: any) => {
        if (value) {
          if (isValidJSON(value)) {
            return null
          } else {
            return 'Invalid Metadata'
          }
        } else {
          return null
        }
      }
    }
  })
  const { data: rows = [], isFetching, isError, isLoading, refetch } = useGetRecords()
  const { data: versionData } = useGetTableVersion()

  const { mutateAsync: mutateAddAsync } = useAddRecord()
  const { mutateAsync: mutateDeleteAsync } = useDeleteRecord()
  const { mutateAsync: mutateUpdateAsync } = useUpdateRecord()

  const { data: rowCount = 0 } = useGetRecordsCount()

  const openDeleteConfirmModal = (row: any) =>
    modals.openConfirmModal({
      centered: true,
      title: <Text fw={700} size='xl'>Are you sure you want to delete this record?</Text>,
      children: (
        <Text>
          Are you sure you want to delete <b>{row.id}</b>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        mutateDeleteAsync({ ids: [row.id] }).then(() => {
          notifications.show({
            color: "green",
            title: "Success",
            message: "Record deleted",
          })
          close()
        }).catch((err: any) => {
          notifications.show({
            color: "red",
            title: "Error",
            message: err.detail[0].msg
          })
        })
      },
    })

  if (collectionId) {
    return (
      <Box style={{ width: "100%", height: "100vh", overflowY: "scroll" }}>
        {/* {isLoading && <Progress value={20} radius="xs" striped animated />} */}
        <Table.ScrollContainer minWidth={500} type="native">
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: "15%" }}>ID</Table.Th>
                <Table.Th style={{ width: "35%" }}>Document</Table.Th>
                <Table.Th style={{ width: "35%" }}>Metadata</Table.Th>
                <Table.Th style={{ width: "10%" }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows.map((row) => (
              <Table.Tr style={{ cursor: "pointer" }} key={row.id} onClick={() => {
                setRecordViewItem(row)
                viewRecordOpen()
              }}>
                <Table.Td>{row.id}</Table.Td>
                <Table.Td>{row.document.length > 60 ? `${row.document.substring(0, 60)}...` : row.document}</Table.Td>
                <Table.Td>{row.metadata !== "null" ? row.metadata.length > 60 ? `${row.metadata.substring(0, 60)}...` : row.metadata : null}</Table.Td>
                <Table.Td>
                  <Flex gap="md">
                    <Tooltip label="Edit">
                      <ActionIcon variant="transparent" size="sm" onClick={(e) => {
                        e.stopPropagation()
                        updateForm.setInitialValues({
                          id: row.id,
                          document: row.document,
                          metadata: row.metadata !== "null" ? row.metadata : "",
                        })
                        updateForm.setValues({
                          id: row.id,
                          document: row.document,
                          metadata: row.metadata !== "null" ? row.metadata : "",
                        })
                        updateRecordOpen()
                      }}>
                        <IconEdit />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <ActionIcon variant="transparent" size="sm" color="red" onClick={(e) => {
                        e.stopPropagation()
                        openDeleteConfirmModal(row)
                      }}>
                        <IconTrash />
                      </ActionIcon>
                    </Tooltip>
                  </Flex>
                </Table.Td>
              </Table.Tr>
            ))}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        <br /><br />
        <Box style={{ position: "fixed", padding: "8px", bottom: 0, width: "100%", backgroundColor: "var(--mantine-color-body)" }}>
          <Group gap={8}>
            <Tooltip label="Add Record">
              <ActionIcon variant="outline" onClick={addRecordOpen}><IconTablePlus stroke={1.3} /></ActionIcon>
            </Tooltip>
            <Tooltip label="Refresh">
              <ActionIcon variant="outline" onClick={() => { refetch() }}><IconRefresh stroke={1.3} /></ActionIcon>
            </Tooltip>
            <Select
              defaultValue={limit}
              allowDeselect={false}
              withCheckIcon={false}
              data={['10', '20', "25", "50"]}
              onChange={(e) => {
                router.push(`?collection-id=${collectionId}&page=${page}&limit=${e}`)
              }}
            />
            <Pagination.Root
              siblings={1}
              total={Math.ceil(rowCount / Number.parseInt(limit))}
              defaultValue={page}
              getItemProps={(page) => ({
                component: Link,
                href: `?collection-id=${collectionId}&page=${page}&limit=${limit}`,
              })}>
              <Group>
                <Pagination.First component={Link} href={`?collection-id=${collectionId}&page=1&limit=${limit}`} />
                <Pagination.Previous component={Link} href={`?collection-id=${collectionId}&page=1&limit=${limit}`} />
                <Pagination.Items />
                <Pagination.Next component={Link} href={`?collection-id=${collectionId}&page=2&limit=${limit}`} />
                <Pagination.Last component={Link} href={`?collection-id=${collectionId}&page=${Math.ceil(rowCount / Number.parseInt(limit))}&limit=${limit}`} />
              </Group>
            </Pagination.Root>
            <Text fw={700}>Total: {rowCount}</Text>
            <Code fw={700}>DB Version:{versionData}</Code>
          </Group>
        </Box>

        <Modal opened={viewRecordOpened} onClose={viewRecordClose} title={<Text fw={700} size='xl'>View Record</Text>} centered size="xl">
          <TextInput
            disabled
            label="ID"
            styles={{
              input: {
                backgroundColor: "unset",
                color: "black",
                opacity: 1
              }
            }}
            value={recordViewItem?.id} />
          <Textarea
            disabled
            mt="md"
            rows={4}
            label="Document"
            styles={{
              input: {
                backgroundColor: "unset",
                color: "black",
                opacity: 1
              }
            }}
            value={recordViewItem?.document || ""} />
          <Textarea
            disabled
            mt="md"
            rows={4}
            label="Metadata"
            styles={{
              input: {
                backgroundColor: "unset",
                color: "black",
                opacity: 1
              }
            }}
            value={recordViewItem?.metadata || ""} />
        </Modal>

        <Modal opened={addRecordOpened} onClose={addRecordClose} title={<Text fw={700} size='xl'>Add Record</Text>} centered>
          <form onSubmit={addForm.onSubmit((values) => {
            let record: any = {
              "ids": [values.id],
              "documents": [values.document]
            }
            if (values.metadata) {
              record.metadatas = [JSON.parse(values.metadata)]
            }
            mutateAddAsync(record).then(() => {
              notifications.show({
                color: "green",
                title: "Success",
                message: "Record added",
              })
              addForm.reset()
              addRecordClose()
            }).catch((err: any) => {
              notifications.show({
                color: "red",
                title: "Error",
                message: err.detail[0].msg
              })
            })
          })}>
            <TextInput
              withAsterisk
              label="ID"
              {...addForm.getInputProps('id')} />
            <Textarea
              autosize
              mt="md"
              label="Document"
              minRows={2}
              maxRows={4}
              {...addForm.getInputProps('document')} />
            <Textarea
              autosize
              mt="md"
              label="Metadata"
              minRows={2}
              maxRows={4}
              {...addForm.getInputProps('metadata')} />
            <Group justify="flex-end" mt="md">
              <Button type="submit">Submit</Button>
            </Group>
          </form>
        </Modal>

        <Modal opened={updateRecordOpened} onClose={updateRecordClose} title={<Text fw={700} size='xl'>Edit Record</Text>} centered size="xl">
          <form onSubmit={updateForm.onSubmit((values) => {
            let record: any = {
              "ids": [values.id],
              "documents": [values.document]
            }
            if (values.metadata) {
              record.metadatas = [JSON.parse(values.metadata)]
            }
            mutateUpdateAsync(record).then(() => {
              notifications.show({
                color: "green",
                title: "Success",
                message: "Record updated",
              })
              updateRecordClose()
            }).catch((err: any) => {
              notifications.show({
                color: "red",
                title: "Error",
                message: err.detail[0].msg
              })
            })
          })}>
            <TextInput
              withAsterisk
              label="ID"
              disabled
              {...updateForm.getInputProps('id')} />
            <Textarea
              autosize
              mt="md"
              label="Document"
              minRows={2}
              maxRows={4}
              {...updateForm.getInputProps('document')} />
            <Textarea
              autosize
              mt="md"
              label="Metadata"
              minRows={2}
              maxRows={4}
              {...updateForm.getInputProps('metadata')} />
            <Group justify="flex-end" mt="md">
              <Button type="submit">Submit</Button>
            </Group>
          </form>
        </Modal>
      </Box>
    )
  } else {
    return (
      <Center h="100vh" w="100vw">
        <IconTableShortcut style={{ width: rem(40), height: rem(40) }} />
        Select collection to see Records
      </Center>
    )
  }
}
