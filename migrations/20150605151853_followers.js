exports.up = function(knex, Promise) {
  return knex.schema.createTable('followers', function(table) {
    table.integer('followers_id').references('id').inTable('users')
    table.integer('use_id')
   });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('followers');
};
