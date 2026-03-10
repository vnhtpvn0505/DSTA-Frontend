# VNT - Hệ thống Đánh giá Trực tuyến (Frontend)

Ứng dụng thi trắc nghiệm trực tuyến dành cho học sinh / sinh viên.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **State:** Zustand (auth store) + TanStack React Query (server state)
- **UI:** Tailwind CSS 4, shadcn/ui (new-york style), Framer Motion
- **Forms:** React Hook Form + Zod validation
- **HTTP:** Axios → `http://220.231.94.117:8081/api/v1`

## Cấu trúc thư mục

```
src/
├── app/
│   ├── (protected)/   # Routes yêu cầu đăng nhập (dashboard, exam, result, reports, settings, student, exams)
│   ├── (public)/      # Routes công khai (login, register)
│   ├── layout.tsx     # Root layout (AppProviders, fonts, metadata)
│   └── page.tsx       # Landing / Login / Register (animated form switch)
├── components/
│   ├── common/        # Navigation, RoleGuard, Loading, ConfirmDialog
│   ├── dashboard/     # Admin dashboard components
│   └── ui/            # shadcn/ui primitives (button, input, form, dialog, label)
├── features/
│   └── auth/          # LoginForm, RegisterForm, FormForgetPassword, auth.schema, auth.service
├── hooks/             # useAuth, useAuthorization
├── lib/               # axios, authorization, queryClient, utils
├── providers/         # AppProviders (QueryClient + GlobalLoading)
├── stores/            # auth.store (Zustand)
├── types/             # user, exam, dashboard, student
└── utils/             # mockUsers
```

## Phân quyền

| Role    | Routes                                                     |
| ------- | ---------------------------------------------------------- |
| Student | `/dashboard`, `/exam`, `/result`                           |
| Admin   | `/dashboard`, `/student`, `/exams`, `/reports`, `/settings`, `/result` |
| Guest   | `/` (landing), `/verify`                                   |

## Chạy local

```bash
yarn install
yarn dev        # http://localhost:3000
```

Yêu cầu Node.js >= 20.9.0.

## Prettier

```json
{ "semi": false, "singleQuote": true, "trailingComma": "es6", "printWidth": 100 }
```
