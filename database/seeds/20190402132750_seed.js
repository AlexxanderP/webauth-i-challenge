exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("users")
    .truncate()
    .then(function() {
      // Inserts seed entries
      return knex("users").insert([
        { id: 1, username: "sallahh", password: "to be hashed" },
        { id: 2, username: "javontayy", password: "to be hashed" },
        { id: 3, username: "alexander", password: "to be hashed" }
      ]);
    });
};
