import { test, expect, APIRequestContext } from '@playwright/test';

test.describe('API Tests', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'https://jsonplaceholder.typicode.com',
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('GET - should fetch users list', async () => {
    const response = await apiContext.get('/users');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('name');
    expect(users[0]).toHaveProperty('email');
  });

  test('POST - should create a new post', async () => {
    const newPost = {
      title: 'Test Post',
      body: 'This is a test post created by Playwright',
      userId: 1,
    };

    const response = await apiContext.post('/posts', {
      data: newPost,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const createdPost = await response.json();
    expect(createdPost).toMatchObject(newPost);
    expect(createdPost).toHaveProperty('id');
  });

  test('PUT - should update an existing post', async () => {
    const updatedPost = {
      id: 1,
      title: 'Updated Post',
      body: 'This post has been updated',
      userId: 1,
    };

    const response = await apiContext.put('/posts/1', {
      data: updatedPost,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData).toMatchObject(updatedPost);
  });

  test('DELETE - should delete a post', async () => {
    const response = await apiContext.delete('/posts/1');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });
});