import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getAllEmails } from "../../actions";
import EmailsClient from "./EmailsClient";

export const dynamic = "force-dynamic";

export default async function EmailsPage() {
    const emailsData = await getAllEmails();

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        }>
            <EmailsClient initialData={emailsData} />
        </Suspense>
    );
}
