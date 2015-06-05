
exports.up = function(knex, Promise) {
  return knex.schema.createTable('messages', function(table) {
    table.increments('user_id').primary();
    table.string('body');
    table.date('post_at');
    table.integer('user_id').references('id').inTable('users');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('messages');
};
