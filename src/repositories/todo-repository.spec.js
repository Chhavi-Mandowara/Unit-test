const TodoRepository = require('./todo-repository');

/**
 * Demo: persistence as async API — good tests assert final state after await,
 * not sleep duration inside _simulateDbDelay.
 */
describe('todo-repository', () => {
  let repo;

  beforeEach(() => {
    repo = new TodoRepository();
  });

  it('save assigns an id and returns a copy of the stored todo', async () => {
    const saved = await repo.save({ title: 'Demo todo', status: 'pending' });

    expect(saved.id).toBe(1);
    expect(saved.title).toBe('Demo todo');
    expect(saved.createdAt).toBeDefined();
    expect(saved.updatedAt).toBeDefined();
  });

  it('findById returns null when missing', async () => {
    expect(await repo.findById(99)).toBeNull();
  });

  it('findAll returns every saved todo', async () => {
    await repo.save({ title: 'One', status: 'pending' });
    await repo.save({ title: 'Two', status: 'completed' });

    const all = await repo.findAll();
    expect(all).toHaveLength(2);
    expect(all.map(t => t.title).sort()).toEqual(['One', 'Two']);
  });

  it('findByStatus filters results', async () => {
    await repo.save({ title: 'A', status: 'pending' });
    await repo.save({ title: 'B', status: 'completed' });

    const pending = await repo.findByStatus('pending');
    expect(pending).toHaveLength(1);
    expect(pending[0].title).toBe('A');
  });

  it('delete returns whether a row existed', async () => {
    const { id } = await repo.save({ title: 'x', status: 'pending' });
    expect(await repo.delete(id)).toBe(true);
    expect(await repo.delete(id)).toBe(false);
  });

  it('count reflects number of todos', async () => {
    expect(await repo.count()).toBe(0);
    await repo.save({ title: 'a', status: 'pending' });
    expect(await repo.count()).toBe(1);
  });
});
