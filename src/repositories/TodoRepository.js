/**
 * In-memory todo repository (simulates database persistence)
 */
class TodoRepository {
  constructor() {
    this.todos = new Map();
    this.nextId = 1;
  }

  async save(todo) {
    // Simulate async database operation
    await this._simulateDbDelay();
    
    if (!todo.id) {
      todo.id = this.nextId++;
      todo.createdAt = new Date().toISOString();
    }
    todo.updatedAt = new Date().toISOString();
    
    this.todos.set(todo.id, { ...todo });
    return { ...todo };
  }

  async findById(id) {
    await this._simulateDbDelay();
    const todo = this.todos.get(id);
    return todo ? { ...todo } : null;
  }

  async findAll() {
    await this._simulateDbDelay();
    return Array.from(this.todos.values()).map(todo => ({ ...todo }));
  }

  async findByStatus(status) {
    await this._simulateDbDelay();
    return Array.from(this.todos.values())
      .filter(todo => todo.status === status)
      .map(todo => ({ ...todo }));
  }

  async delete(id) {
    await this._simulateDbDelay();
    const existed = this.todos.has(id);
    this.todos.delete(id);
    return existed;
  }

  async count() {
    await this._simulateDbDelay();
    return this.todos.size;
  }

  // Test helper methods
  clear() {
    this.todos.clear();
    this.nextId = 1;
  }

  async _simulateDbDelay() {
    // Simulate database latency
    return new Promise(resolve => {
      setTimeout(resolve, 1);
    });
  }
}

module.exports = TodoRepository;