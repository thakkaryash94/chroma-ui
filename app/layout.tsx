'use client'
import { ModalsProvider } from '@mantine/modals'
import { MantineProvider, ColorSchemeScript, MantineColorsTuple, createTheme } from "@mantine/core"
import "@mantine/core/styles.css"
import '@mantine/notifications/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Notifications } from '@mantine/notifications'

const myColor: MantineColorsTuple = [
  '#e5f2ff',
  '#cde1ff',
  '#9ac0ff',
  '#629dff',
  '#367fff',
  '#186cff',
  '#0062ff',
  '#0052e5',
  '#0049cd',
  '#003eb6'
];

const theme = createTheme({
  colors: {
    myColor
  }
});

const queryClient = new QueryClient()

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <title>Chroma DB UI</title>
        <meta name="description" content="Chroma" />
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body style={{ minHeight: "100vh" }}>
        <QueryClientProvider client={queryClient}>
          <MantineProvider 
            theme={theme}
            defaultColorScheme={"auto"}
          >
            <Notifications />
            <ModalsProvider>
              {children}
            </ModalsProvider>
          </MantineProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
