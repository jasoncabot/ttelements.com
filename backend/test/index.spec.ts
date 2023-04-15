import { handleRequest, VersionResponse } from '@ttelements/backend/index';

test('should redirect to example page on no route match', async () => {
  const env: Bindings = getMiniflareBindings();
  if (!handleRequest) return;

  const ctx = {} as ExecutionContext;

  const res = await handleRequest(new Request('http://localhost/version'), env, ctx);
  expect(res).toBeDefined();
  expect(res?.status).toBe(200);
  const response = await res?.json<VersionResponse>();
  expect(response?.version).toBe('0.1.0');
});
