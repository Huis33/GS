import { Redirect } from 'expo-router';

export default function Page() {
    // Casting to 'any' tells TypeScript: "Trust me, this path exists"
    return <Redirect href={"/(jurutera)/(tabs)" as any} />;
}