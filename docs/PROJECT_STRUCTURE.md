# Project Structure

```text
app/
  staff/
    login/
      verify-otp/
    forgot-password/
      verify-otp/
      reset/
  dashboard/
  technicians/
  profile/

src/
  shared/
    api/
    auth/
    lib/
    types/
    ui/
  views/
    auth/
    dashboard/
    technicians/
    profile/
  widgets/
    auth/
    dashboard/
    technicians/
```

`/staff/login` is shared by Owner/Staff and Technician users. Their role is read from the backend account after the email/password + OTP login flow.
