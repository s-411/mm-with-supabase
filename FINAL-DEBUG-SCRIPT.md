# Final Debug Script - Check JWT Signing

## Run This in Browser Console (on measuredmanaged.app)

```javascript
async function finalDebug() {
  console.log('=== FINAL JWT DEBUG ===\n');

  // 1. Check Clerk session
  const session = await window.Clerk?.session;
  if (!session) {
    console.error('❌ No Clerk session - not logged in');
    return;
  }
  console.log('✅ Clerk session exists');
  console.log('User ID:', session.user?.id);

  // 2. Get token
  const token = await session.getToken({ template: 'supabase' });
  if (!token) {
    console.error('❌ No token returned');
    console.error('Check if JWT template named "supabase" exists in Clerk');
    return;
  }
  console.log('✅ Token generated\n');

  // 3. Decode JWT parts
  const parts = token.split('.');
  const header = JSON.parse(atob(parts[0]));
  const payload = JSON.parse(atob(parts[1]));

  console.log('JWT Header:', header);
  console.log('JWT Payload:', payload);
  console.log('');

  // 4. Critical checks
  console.log('=== CRITICAL CHECKS ===');
  console.log('Algorithm:', header.alg);
  console.log('  ✓ Expected: HS256 (with custom signing)');
  console.log('  ✓ If RS256: Custom signing is OFF - turn it ON in Clerk');
  console.log('');

  console.log('Claims:');
  console.log('  sub:', payload.sub);
  console.log('  aud:', payload.aud);
  console.log('  role:', payload.role);
  console.log('  email:', payload.email);
  console.log('');

  const checks = {
    'Algorithm is HS256': header.alg === 'HS256',
    'has sub': !!payload.sub,
    'has aud': !!payload.aud,
    'aud = authenticated': payload.aud === 'authenticated',
    'has role': !!payload.role,
    'role = authenticated': payload.role === 'authenticated',
  };

  console.table(checks);

  // 5. Test Supabase request
  console.log('\n=== TESTING SUPABASE REQUEST ===');
  try {
    const response = await fetch(
      `https://vbzwmjkniowxmecutymj.supabase.co/rest/v1/user_profiles?clerk_user_id=eq.${payload.sub}`,
      {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiendtamtuaW93eG1lY3V0eW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTc4NzIsImV4cCI6MjA3NjM3Mzg3Mn0.wH3RIAqx982sGThvem17WwtTSXnNKgMW9jtVQc0DuJ8',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Response status:', response.status);

    if (response.status === 401) {
      console.error('❌ 401 Unauthorized');
      console.error('This means Supabase rejected the JWT');
      console.error('\nPossible causes:');
      console.error('1. Custom signing is OFF in Clerk (check algorithm above)');
      console.error('2. Wrong JWT secret used in Clerk');
      console.error('3. JWT secret in Clerk doesn\'t match Supabase JWT secret');

      const errorText = await response.text();
      console.error('Error details:', errorText);
    } else if (response.status === 200) {
      const data = await response.json();
      console.log('✅ SUCCESS! Profile data:', data);

      if (data.length === 0) {
        console.log('⚠️ No profile found - need to create one');
      } else {
        console.log('✅ Profile exists!');
      }
    } else {
      console.log('Unexpected status:', response.status);
      const text = await response.text();
      console.log('Response:', text);
    }
  } catch (error) {
    console.error('Network error:', error);
  }

  console.log('\n=== SUMMARY ===');
  if (header.alg !== 'HS256') {
    console.error('❌ PROBLEM: Algorithm is', header.alg);
    console.error('👉 FIX: Enable "Custom signing key" in Clerk JWT template');
    console.error('👉 Add Supabase JWT secret to the custom signing key field');
  } else {
    console.log('✅ Algorithm correct (HS256)');
    console.log('If still getting 401, the JWT secret in Clerk is wrong');
    console.log('Check Supabase Dashboard → Settings → API → JWT Secret');
  }
}

finalDebug();
```

## What This Tests

1. **Clerk session exists** - User is logged in
2. **Token generation** - Template "supabase" exists
3. **JWT algorithm** - Should be HS256 if custom signing is enabled
4. **JWT claims** - Checks all required claims
5. **Direct Supabase request** - Tests if Supabase accepts the token

## Expected Results

### If Algorithm is RS256:
❌ Custom signing is **OFF** in Clerk
- Go to Clerk → JWT Templates → supabase
- Enable "Custom signing key"
- Add Supabase JWT secret

### If Algorithm is HS256 but still 401:
❌ Wrong JWT secret used in Clerk
- Double-check you copied the correct JWT secret from Supabase
- It should be from: Settings → API → JWT Secret (not anon/service_role keys)

### If Algorithm is HS256 and no 401:
✅ Everything working! Profile will be created automatically
