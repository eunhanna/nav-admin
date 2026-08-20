import { Alert, Button, Card, Form, Input, Space, Spin, Typography } from 'antd'
import type { InputRef } from 'antd'
import {
  ArrowLeftOutlined,
  LockOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  isApiConfigured,
  loginWithPassword,
  requestLoginCode,
  restoreSession,
  setupPassword,
  verifyLoginCode,
} from '../api'

type Step = 'email' | 'password' | 'code' | 'setup'
export default function LoginPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [checking, setChecking] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const codeRef = useRef<InputRef>(null)
  useEffect(() => {
    restoreSession()
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => setChecking(false))
  }, [navigate])
  useEffect(() => {
    if (step === 'code') codeRef.current?.focus()
  }, [step])
  useEffect(() => {
    if (!cooldown) return
    const timer = window.setInterval(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [cooldown])
  async function sendCode() {
    setBusy(true)
    setError('')
    try {
      const value = email.trim()
      await requestLoginCode(value)
      setEmail(value)
      setCode('')
      setStep('code')
      setCooldown(60)
    } catch {
      setError('暂时无法发送验证码，请检查网络后重试。')
    } finally {
      setBusy(false)
    }
  }
  async function submit() {
    setBusy(true)
    setError('')
    try {
      if (step === 'email') {
        setStep('password')
        return
      }
      if (step === 'password') {
        await loginWithPassword(email.trim(), password)
        navigate('/dashboard', { replace: true })
        return
      }
      if (step === 'code') {
        await verifyLoginCode(email, code)
        setPassword('')
        setStep('setup')
        return
      }
      await setupPassword(password)
      navigate('/dashboard', { replace: true })
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : ''
      setError(
        message === 'invalid_password'
          ? '密码至少 8 位，且必须包含字母和数字。'
          : step === 'password'
            ? '邮箱或密码错误，请重试。'
            : step === 'code'
              ? '验证码错误、已过期或尝试次数过多，请重新获取。'
              : '操作失败，请稍后重试。',
      )
    } finally {
      setBusy(false)
    }
  }
  if (!isApiConfigured)
    return (
      <main className="login-shell">
        <Card>
          <Typography.Title level={2}>登录服务暂未配置</Typography.Title>
          <Typography.Paragraph>请配置 VITE_API_URL。</Typography.Paragraph>
        </Card>
      </main>
    )
  return (
    <main className="login-shell">
      <a className="login-back" href="https://eunhacc.cyou/">
        <ArrowLeftOutlined /> 返回导航
      </a>
      <Card className="login-card" variant="borderless">
        {checking ? (
          <Space direction="vertical" align="center">
            <Spin size="large" />
            <Typography.Title level={3}>正在恢复会话</Typography.Title>
          </Space>
        ) : (
          <Form layout="vertical" onFinish={submit}>
            <Typography.Text className="eyebrow">EUNO ADMIN</Typography.Text>
            <Typography.Title level={2}>
              {step === 'email'
                ? '连接管理端'
                : step === 'password'
                  ? '输入密码登录'
                  : step === 'code'
                    ? '输入邮件验证码'
                    : '设置登录密码'}
            </Typography.Title>
            <Typography.Paragraph type="secondary">
              {step === 'email'
                ? '输入管理员邮箱，选择登录方式。'
                : `账号：${email}`}
            </Typography.Paragraph>
            {step === 'email' && (
              <Form.Item label="邮箱地址" required>
                <Input
                  autoFocus
                  prefix={<MailOutlined />}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Form.Item>
            )}
            {(step === 'password' || step === 'setup') && (
              <Form.Item label="密码" required>
                <Input.Password
                  autoFocus
                  prefix={<LockOutlined />}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Form.Item>
            )}
            {step === 'code' && (
              <Form.Item label="6 位验证码" required>
                <Input
                  ref={codeRef}
                  value={code}
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                />
              </Form.Item>
            )}
            {error && (
              <Alert
                className="login-alert"
                type="error"
                showIcon
                title={error}
              />
            )}
            <Button
              block
              type="primary"
              htmlType="submit"
              loading={busy}
              disabled={step === 'code' && code.length !== 6}
            >
              {step === 'email'
                ? '继续'
                : step === 'password'
                  ? '密码登录'
                  : step === 'code'
                    ? '验证并继续'
                    : '保存密码并登录'}
            </Button>
            <div className="login-actions">
              {step !== 'email' && (
                <Button
                  type="link"
                  onClick={() => {
                    setStep('email')
                    setError('')
                  }}
                >
                  更换邮箱
                </Button>
              )}
              {step === 'password' && (
                <>
                  <Button type="link" onClick={() => void sendCode()}>
                    使用验证码登录
                  </Button>
                  <Button type="link" onClick={() => void sendCode()}>
                    忘记密码
                  </Button>
                </>
              )}
              {step === 'code' && (
                <Button
                  type="link"
                  disabled={busy || Boolean(cooldown)}
                  onClick={() => void sendCode()}
                >
                  {cooldown ? `${cooldown} 秒后可重发` : '重新发送验证码'}
                </Button>
              )}
            </div>
          </Form>
        )}
      </Card>
    </main>
  )
}
