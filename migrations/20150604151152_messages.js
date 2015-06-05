
exports.up = function(knex, Promise) {
  return knex.schema.createTable('messages', function(table) {
    table.integer('user_id').references('id').inTable('users')
    table.string('person');
    table.string('body');
    table.timestamp('post_at').defaultTo(knex.raw('now()')) 
   });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('messages');
};
