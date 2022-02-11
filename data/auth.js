let users = [
  {
    id: '1',
    username: "seunghyun",
    password: '$2b$12$G9xf8SFq3oTEgdj7ozHQ/uhDOyeQcUEDU8tnOcvpvApuadr3nE5Vm',
    name: "Seunghyun",
    email: "TEAM_MOBA@jungle.com",
  },
  {
    id: '2',
    username: "moba",
    password: '$2b$12$G9xf8SFq3oTEgdj7ozHQ/uhDOyeQcUEDU8tnOcvpvApuadr3nE5Vm',
    name: "Moba",
    email: "MOBA@jungle.com",
  },
  {
    id: '3',
    username: "teammoba",
    password: '$2b$12$G9xf8SFq3oTEgdj7ozHQ/uhDOyeQcUEDU8tnOcvpvApuadr3nE5Vm',
    name: "Moba",
    email: "teamMOBA@jungle.com",
  },
];

export async function findByUsername(username) {
  return users.find((user) => user.username === username);
}

export async function findById(id) {
  return users.find((user) => user.id === id);
}

export async function createUser(user) {
  const created = { ...user, id: Date.now().toString() };
  users.push(created);
  return created.id;
}

