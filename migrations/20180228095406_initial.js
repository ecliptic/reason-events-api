const MigrationUtils = require('../src/utils/MigrationUtils')

exports.up = function (knex, Promise) {
  const schema = MigrationUtils.schema(knex)

  return (
    // Kick off a promise chain
    Promise.resolve()

      .then(() => knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
      .then(() => knex.raw('CREATE SCHEMA events;'))

      // User
      .then(() =>
        knex.schema.withSchema('events').createTable('user', function (table) {
          const columns = schema(table)
          columns.primaryUuid()

          table.timestamps(true, true)

          // fields
          table.string('name')
            .comment(`The User''s display name.`)

          table.string('email')
            .unique()
            .comment(`The User''s email address`)

          table.string('headline')
            .comment('A headline introducing the User at a glance.')

          table.boolean('mailing_list')
            .comment('Whether the User wants to join the mailing list.')
        })
      )

      // User constraints
      .then(() => knex.raw(`
        alter table events.user
          add constraint check_email check (email ~* '^.+@.+\\..+$');
      `))

      // EventType
      .then(() => knex.raw(`
        create type events.event_type as enum (
          'default',
          'meetup'
        );
      `))

      // Event
      .then(() =>
        knex.schema.withSchema('events').createTable('event', function (table) {
          const columns = schema(table)
          columns.primaryUuid()

          table.timestamps(true, true)

          // fields
          table.string('name')
            .notNullable()
            .comment('The Event name. Required.')

          table.dateTime('date')
            .notNullable()
            .comment(`The Event''s date/time object. Required.`)

          table.specificType('event_type', 'events.event_type')
            .notNullable()
            .comment('The event type. Required.')

          table.string('location').comment('The location of the Event, which could be an address.')

          table.text('description').comment(`The Event''s description.`)

          // relationships
          columns.foreignUuid({column: 'owner', reference: {column: 'id', table: 'events.user'}})
            .comment('The User that created the Event.')
        })
      )
  )
}

exports.down = function (knex, Promise) {
  throw new Error('Downward migrations are not supported. Restore from backup.')
}
