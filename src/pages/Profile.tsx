import { useEffect, useState } from "react";
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBBtn,
  MDBTypography,
  MDBIcon,
} from "mdb-react-ui-kit";
import { useAuth } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

type ProfileRow = {
  user_id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  username?: string | null; // @kullanici
  website?: string | null;
  wallets_balance?: number | null;
  followers?: number | null;
  transactions?: number | null;
  facebook?: string | null;
  twitter?: string | null;
  skype?: string | null;
  role?: "user" | "admin" | null;
};

export default function ProfilePage() {
  const { user } = useAuth(); // id / email / role bizde store’da vardı
  const [p, setP] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (!error) setP(data as ProfileRow);
      setLoading(false);
    })();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="authwrap">
        <div className="card">Profil için giriş yapmalısınız.</div>
      </div>
    );
  }

  const avatar =
    p?.avatar_url ||
    "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp";

  const displayName =
    p?.display_name || user.email?.split("@")[0] || "Kullanıcı";
  const username = p?.username ? `@${p.username}` : "@user";
  const website = p?.website || "#";

  return (
    <div className="vh-100" style={{ backgroundColor: "#eee" }}>
      <MDBContainer className="container py-5 h-100">
        <MDBRow className="justify-content-center align-items-center h-100">
          <MDBCol md="12" xl="4">
            <MDBCard style={{ borderRadius: "15px" }}>
              <MDBCardBody className="text-center">
                <div className="mt-3 mb-4">
                  <MDBCardImage
                    src={avatar}
                    className="rounded-circle"
                    fluid
                    style={{ width: "100px" }}
                    alt="avatar"
                  />
                </div>

                <MDBTypography tag="h4">
                  {displayName}{" "}
                  {user.role === "admin" && (
                    <span style={{ fontSize: 12, opacity: 0.7 }}>(admin)</span>
                  )}
                </MDBTypography>

                <MDBCardText className="text-muted mb-4">
                  {user?.role === "admin" && (
                    <div style={{ marginTop: 30 }}>
                      <Link to="/admin" className="btn btn--primary">
                        Admin Paneline Git
                      </Link>
                    </div>
                  )}
                </MDBCardText>

                <div className="mb-4 pb-2">
                  {p?.facebook && (
                    <MDBBtn
                      outline
                      floating
                      href={p.facebook}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="facebook"
                    >
                      <MDBIcon fab icon="facebook" size="lg" />
                    </MDBBtn>
                  )}
                  {p?.twitter && (
                    <MDBBtn
                      outline
                      floating
                      className="mx-1"
                      href={p.twitter}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="twitter"
                    >
                      <MDBIcon fab icon="twitter" size="lg" />
                    </MDBBtn>
                  )}
                  {p?.skype && (
                    <MDBBtn
                      outline
                      floating
                      href={p.skype}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="skype"
                    >
                      <MDBIcon fab icon="skype" size="lg" />
                    </MDBBtn>
                  )}
                </div>

                <MDBBtn rounded size="lg">
                  Mesaj Gönder
                </MDBBtn>

                <div className="d-flex justify-content-between text-center mt-5 mb-2">
                  <div>
                    <MDBCardText className="mb-1 h5">
                      {p?.wallets_balance ?? 0}
                    </MDBCardText>
                    <MDBCardText className="small text-muted mb-0">
                      Cüzdan Bakiyesi
                    </MDBCardText>
                  </div>
                  <div className="px-3">
                    <MDBCardText className="mb-1 h5">
                      {p?.followers ?? 0}
                    </MDBCardText>
                    <MDBCardText className="small text-muted mb-0">
                      Takipçi
                    </MDBCardText>
                  </div>
                  <div>
                    <MDBCardText className="mb-1 h5">
                      {p?.transactions ?? 0}
                    </MDBCardText>
                    <MDBCardText className="small text-muted mb-0">
                      İşlem
                    </MDBCardText>
                  </div>
                </div>

                {loading && <div className="text-muted mt-3">Yükleniyor…</div>}
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}
