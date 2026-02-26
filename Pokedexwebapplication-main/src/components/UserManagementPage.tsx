import { useEffect, useState } from "react";

interface User {
    id: string;
    username: string;
    email: string;
    roles: string[];
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/api/users", {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }

                const data = await response.json();
                setUsers(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const response = await fetch(`/api/users/${userId}/roles`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                throw new Error("Failed to update role");
            }

            // Update UI after success
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === userId
                        ? { ...user, roles: [newRole] }
                        : user
                )
            );
        } catch {
            alert("Failed to update role");
        }
    };

    if (loading) return <p>Loading users...</p>;

    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ padding: "2rem" }}>
            <h1>User Management</h1>

            <table border={1} cellPadding={10} style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Roles</th>
                        <th>Manage Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.roles.join(", ")}</td>
                            <td>
                                <select
                                    value={user.roles[0]}
                                    onChange={(e) =>
                                        handleRoleChange(user.id, e.target.value)
                                    }
                                >
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}