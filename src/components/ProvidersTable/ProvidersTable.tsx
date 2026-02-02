import { IProvider } from '../../types/IProvider';

export default function ProvidersTable({ providers }: { providers: IProvider[] }) {
    return (
        <table border={1}>
            <thead>
                <tr>
                    <th>Provider ID</th>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {providers.map((provider) => (
                    <tr key={provider.id}>
                        <td>{provider.id}</td>
                        <td>{provider.type}</td>
                        <td>{provider.name}</td>
                        <td>{provider.enabled ? 'Active' : 'Inactive'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
