import NextAuth from 'next-auth'
import { authEdgeConfig } from './auth-edge-config'

export const { auth } = NextAuth(authEdgeConfig)