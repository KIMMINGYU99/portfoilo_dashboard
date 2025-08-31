import { useEffect, useState } from "react";
import PageHeader from "@components/common/PageHeader";
import {
  UserIcon,
  LinkIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import ActionButton from "@components/common/ActionButton";
import { User, CareerTimeline } from "@services/supabase";
import LoadingView from "@components/common/LoadingView";
import ErrorView from "@components/common/ErrorView";
import { notifyError, notifySuccess } from "@utils/notify";
import EditCareerModal from "@components/modals/EditCareerModal";
import EditCertificationModal, {
  CertificationItem,
} from "@components/modals/EditCertificationModal";
import EditSocialLinkModal from "@components/modals/EditSocialLinkModal";
import { CareerService } from "@services/careerService";
import { UserService } from "@services/userService";
import { StorageService } from "@services/storageService";

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [careerItems, setCareerItems] = useState<CareerTimeline[]>([]);
  const [careerOpen, setCareerOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<CareerTimeline | null>(
    null
  );
  const [editingBasic, setEditingBasic] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificationItem | null>(
    null
  );
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<{
    key: string;
    url: string;
  } | null>(null);

  // URL 간단 검증
  const isValidUrl = (value: string | null | undefined): boolean => {
    if (!value) return false;
    try {
      const u = new URL(value);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  };

  // 간단한 기본 사용자 로드 (기본: kmk4604@gmail.com)
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const u = await UserService.getDefaultUser();
        if (!u) throw new Error("기본 사용자 정보를 찾을 수 없습니다.");
        setUser(u);
        // 커리어 타임라인은 서비스에서 조회 (실패해도 페이지는 유지)
        if (u?.id) {
          try {
            const careers = await CareerService.listByUser(u.id);
            setCareerItems(careers);
          } catch (cErr) {
            notifyError(cErr, "경력 정보를 불러오지 못했습니다.");
          }
        }
      } catch (e) {
        const msg = notifyError(e, "프로필을 불러오지 못했습니다.");
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const startEditBasic = () => {
    if (!user) return;
    setNameDraft(user.name || "");
    setPhoneDraft(user.phone || "");
    setEditingBasic(true);
    setAvatarFile(null);
    setAvatarPreview(user.avatar_url || null);
  };

  const cancelEditBasic = () => {
    setEditingBasic(false);
  };

  const saveBasic = async () => {
    if (!user) return;
    try {
      // 전화번호 정규화: 숫자만 → 3-4-4 하이픈 포맷
      const digits = (phoneDraft || "").replace(/\D/g, "");
      let normalizedPhone = phoneDraft;
      if (digits.length >= 9) {
        const a = digits.slice(0, 3);
        const b = digits.slice(3, 7);
        const c = digits.slice(7, 11);
        normalizedPhone = [a, b, c].filter(Boolean).join("-");
      }
      let nextAvatarUrl = avatarPreview || user.avatar_url || null;
      if (avatarFile) {
        const url = await StorageService.uploadPublic(
          "project-media",
          avatarFile,
          "avatars"
        );
        if (url) nextAvatarUrl = url;
      }
      // 소셜 링크 정리: key/value trim + URL 유효 항목만 저장
      const cleanedLinks: Record<string, string> = {};
      Object.entries(user.social_links || {}).forEach(([k, v]) => {
        const key = (k || "").trim();
        const val = (v || "").trim();
        if (key && isValidUrl(val)) cleanedLinks[key] = val;
      });

      const updated = await UserService.updateUser(user.id, {
        name: nameDraft,
        phone: normalizedPhone,
        avatar_url: (nextAvatarUrl as any) || null,
        social_links: cleanedLinks as any,
      });
      if (!updated) throw new Error("사용자 업데이트 실패");
      setUser(updated as User);
      notifySuccess("기본 정보를 저장했습니다.");
    } catch (e) {
      notifyError(e, "기본 정보를 저장하지 못했습니다.");
    } finally {
      setEditingBasic(false);
    }
  };

  const startEditBio = () => {
    if (!user) return;
    setBioDraft(user.bio || "");
    setEditingBio(true);
  };

  const cancelEditBio = () => {
    setEditingBio(false);
  };

  const saveBio = async () => {
    if (!user) return;
    try {
      const updated = await UserService.updateUser(user.id, { bio: bioDraft });
      if (!updated) throw new Error("소개 저장 실패");
      setUser(updated as User);
      notifySuccess("소개를 저장했습니다.");
    } catch (e) {
      notifyError(e, "소개를 저장하지 못했습니다.");
    } finally {
      setEditingBio(false);
    }
  };

  if (loading) return <LoadingView message="프로필을 불러오는 중..." />;
  if (error) return <ErrorView message={error} fullScreen />;
  if (!user) return <ErrorView message="프로필 정보가 없습니다." fullScreen />;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <PageHeader
        pageIcon={UserIcon}
        pageName="프로필"
        title="내 프로필"
        description="기본 정보, 소셜 링크, 자격증과 경력 정보를 관리합니다"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 기본 정보 */}
        <section className="lg:col-span-2 card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">기본 정보</h2>
            {editingBasic ? (
              <div className="flex gap-2">
                <ActionButton
                  text="취소"
                  variant="outline"
                  onClick={cancelEditBasic}
                />
                <ActionButton
                  text="저장"
                  variant="primary"
                  onClick={saveBasic}
                />
              </div>
            ) : (
              <ActionButton
                text="편집"
                variant="outline"
                onClick={startEditBasic}
              />
            )}
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {editingBasic ? (
                <>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-8 h-8 text-gray-500" />
                  )}
                </>
              ) : user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <div>
              <div className="text-sm text-gray-600">이메일</div>
              <div className="font-medium">{user.email}</div>
            </div>
          </div>
          {editingBasic ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">이름</label>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  전화번호
                </label>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  value={phoneDraft}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9-]/g, "");
                    // 자동 하이픈 삽입(간단)
                    const digits = v.replace(/\D/g, "");
                    let formatted = v;
                    if (digits.length <= 3) formatted = digits;
                    else if (digits.length <= 7)
                      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                    else
                      formatted = `${digits.slice(0, 3)}-${digits.slice(
                        3,
                        7
                      )}-${digits.slice(7, 11)}`;
                    setPhoneDraft(formatted);
                  }}
                  placeholder="예: 010-1234-5678"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">
                  프로필 아이콘
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 border rounded cursor-pointer text-sm bg-white hover:bg-gray-50">
                    이미지 선택
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        if (f && f.size > 2 * 1024 * 1024) {
                          alert("파일 크기는 2MB 이하여야 합니다.");
                          return;
                        }
                        setAvatarFile(f);
                        if (f) {
                          const url = URL.createObjectURL(f);
                          setAvatarPreview(url);
                        } else {
                          setAvatarPreview(user.avatar_url || null);
                        }
                      }}
                    />
                  </label>
                  {avatarPreview && (
                    <ActionButton
                      type="button"
                      text="제거"
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                    />
                  )}
                  {avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="preview"
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">이름</div>
                <div className="font-medium">{user.name || "미등록"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">전화번호</div>
                <div className="font-medium">{user.phone || "미등록"}</div>
              </div>
            </div>
          )}
        </section>

        {/* 소셜 링크 */}
        <section className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">소셜 링크</h2>
            <ActionButton
              text="추가"
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingSocial(null);
                setSocialModalOpen(true);
              }}
            />
          </div>
          {editingBasic ? (
            <div className="space-y-2">
              {Object.entries(user.social_links || {}).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <input
                    className="w-28 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    value={k}
                    onChange={(e) => {
                      const next = { ...(user.social_links || {}) } as any;
                      const val = next[k];
                      delete next[k];
                      next[e.target.value.trim()] = val;
                      setUser({ ...(user as any), social_links: next } as User);
                    }}
                  />
                  <input
                    className="flex-1 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    value={v}
                    onChange={(e) => {
                      const next = { ...(user.social_links || {}) } as any;
                      next[k] = e.target.value;
                      setUser({ ...(user as any), social_links: next } as User);
                    }}
                  />
                  <ActionButton
                    text="삭제"
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      const next = { ...(user.social_links || {}) } as any;
                      delete next[k];
                      setUser({ ...(user as any), social_links: next } as User);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(user.social_links || {}).map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <LinkIcon className="w-4 h-4 text-gray-500" />
                    <div className="text-sm text-gray-600 w-24 truncate">
                      {k}
                    </div>
                    <a
                      href={v}
                      target="_blank"
                      className="text-sm text-primary-600 underline break-all"
                      rel="noreferrer"
                    >
                      {v}
                    </a>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <ActionButton
                      size="sm"
                      variant="outline"
                      text="편집"
                      onClick={() => {
                        setEditingSocial({ key: k, url: v });
                        setSocialModalOpen(true);
                      }}
                    />
                    <ActionButton
                      size="sm"
                      variant="danger"
                      text="삭제"
                      onClick={async () => {
                        const next = { ...(user.social_links || {}) } as any;
                        delete next[k];
                        const updated = await UserService.updateUser(user.id, {
                          social_links: next,
                        });
                        if (updated) setUser(updated as User);
                        notifySuccess("삭제되었습니다.");
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 소개 */}
        <section className="lg:col-span-2 card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">소개</h2>
            {editingBio ? (
              <div className="flex gap-2">
                <ActionButton
                  text="취소"
                  variant="outline"
                  onClick={cancelEditBio}
                />
                <ActionButton text="저장" variant="primary" onClick={saveBio} />
              </div>
            ) : (
              <ActionButton
                text="편집"
                variant="outline"
                onClick={startEditBio}
              />
            )}
          </div>
          {editingBio ? (
            <textarea
              className="w-full px-3 py-2 border rounded-lg min-h-[120px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value)}
            />
          ) : (
            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-100">
              {user.bio || "소개가 없습니다."}
            </div>
          )}
        </section>

        {/* 자격증 정보 */}
        <section className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">자격증 정보</h2>
            <ActionButton
              icon={PlusIcon}
              text="추가"
              variant="outline"
              onClick={() => {
                setEditingCert({ name: "" });
                setCertModalOpen(true);
              }}
            />
          </div>
          <ul className="space-y-2 text-sm">
            {(user.certifications || []).map((c, idx) => (
              <li key={idx} className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-gray-600">
                    {c.issuer ? `${c.issuer} · ` : ""}
                    {c.issued_at
                      ? `취득: ${new Date(c.issued_at).toLocaleDateString()}`
                      : ""}
                    {c.expires_at
                      ? ` · 만료: ${new Date(
                          c.expires_at
                        ).toLocaleDateString()}`
                      : ""}
                  </div>
                </div>
                {(c.credential_url || c.credential_id) && (
                  <div className="text-xs text-primary-600 truncate max-w-[180px] text-right">
                    {c.credential_url ? (
                      <a
                        href={c.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        인증 링크
                      </a>
                    ) : (
                      c.credential_id
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 ml-2">
                  <ActionButton
                    text="편집"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingCert(c as any);
                      setCertModalOpen(true);
                    }}
                  />
                  <ActionButton
                    text="삭제"
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      const next = (user.certifications || []).filter(
                        (_, i) => i !== idx
                      );
                      const updated = await UserService.updateUser(user.id, {
                        certifications: next as any,
                      });
                      if (updated) setUser(updated as User);
                      notifySuccess("삭제되었습니다.");
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 경력 */}
        <section className="lg:col-span-2 card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">커리어 타임라인</h2>
            <ActionButton
              icon={PlusIcon}
              text="추가"
              variant="outline"
              onClick={() => {
                setEditingCareer({} as any);
                setCareerOpen(true);
              }}
            />
          </div>
          <ul className="space-y-3 text-sm">
            {careerItems.length === 0 ? (
              <div className="text-gray-500">등록된 경력이 없습니다.</div>
            ) : (
              careerItems.map((c) => {
                const period = c.current
                  ? `${new Date(c.start_date).toLocaleDateString()} ~ 현재`
                  : `${new Date(c.start_date).toLocaleDateString()} ~ ${
                      c.end_date
                        ? new Date(c.end_date).toLocaleDateString()
                        : ""
                    }`;
                return (
                  <li
                    key={c.id}
                    className="p-3 border rounded-lg relative bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  >
                    {/* 액션 아이콘 (우측 상단) */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <ActionButton
                        icon={PencilSquareIcon}
                        iconOnly
                        aria-label="경력 편집"
                        styles={{
                          variantClass:
                            "p-1.5 bg-white/70 hover:bg-white text-gray-700 border border-gray-200 dark:bg-gray-700/70 dark:hover:bg-gray-700 dark:text-gray-100 dark:border-gray-600",
                        }}
                        onClick={() => {
                          setEditingCareer(c);
                          setCareerOpen(true);
                        }}
                      />
                      <ActionButton
                        icon={TrashIcon}
                        iconOnly
                        aria-label="경력 삭제"
                        styles={{
                          variantClass:
                            "p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-300 dark:border-red-700",
                        }}
                        onClick={async () => {
                          await CareerService.remove(c.id);
                          notifySuccess("삭제되었습니다.");
                          const refreshed = await CareerService.listByUser(
                            user.id
                          );
                          setCareerItems(refreshed);
                        }}
                      />
                    </div>

                    <div className="font-medium pr-16">
                      {c.title} {c.organization ? `· ${c.organization}` : ""}
                    </div>
                    <div className="text-gray-600">
                      {period} {c.type ? `· ${c.type}` : ""}
                    </div>
                    {c.description && (
                      <div className="mt-1 whitespace-pre-wrap">
                        {c.description}
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </section>
      </div>

      {/* 하단 전체 저장 버튼 제거: 각 섹션 개별 저장으로 통일 */}

      <EditCareerModal
        isOpen={careerOpen}
        onClose={() => setCareerOpen(false)}
        item={editingCareer}
        onSaved={async () => {
          if (!user) return;
          setCareerOpen(false);
          if (editingCareer && (editingCareer as any).id) {
            // update
            await CareerService.update(
              (editingCareer as any).id,
              editingCareer as any
            );
          } else {
            // create
            const payload = editingCareer as any;
            payload.user_id = user.id;
            await CareerService.create(payload);
          }
          notifySuccess("저장되었습니다.");
          const refreshed = await CareerService.listByUser(user.id);
          setCareerItems(refreshed);
        }}
        onDeleted={async () => {
          if (!user || !editingCareer) return;
          await CareerService.remove((editingCareer as any).id);
          notifySuccess("삭제되었습니다.");
          setCareerOpen(false);
          const refreshed = await CareerService.listByUser(user.id);
          setCareerItems(refreshed);
        }}
      />

      <EditCertificationModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        item={editingCert}
        onSaved={async (form) => {
          if (!user) return;
          const list = Array.isArray(user.certifications)
            ? [...user.certifications]
            : [];
          const idx = editingCert
            ? list.findIndex(
                (x) =>
                  (x as any).name === (editingCert as any).name &&
                  (x as any).issuer === (editingCert as any).issuer
              )
            : -1;
          if (idx >= 0) {
            list[idx] = form as any;
          } else {
            list.push(form as any);
          }
          const updated = await UserService.updateUser(user.id, {
            certifications: list as any,
          });
          if (updated) setUser(updated as User);
          setCertModalOpen(false);
          notifySuccess("저장되었습니다.");
        }}
        onDeleted={async () => {
          if (!user || !editingCert) return;
          const list = (user.certifications || []).filter(
            (c) =>
              c.name !== (editingCert as any).name ||
              c.issuer !== (editingCert as any).issuer
          );
          const updated = await UserService.updateUser(user.id, {
            certifications: list as any,
          });
          if (updated) setUser(updated as User);
          setCertModalOpen(false);
          notifySuccess("삭제되었습니다.");
        }}
      />

      <EditSocialLinkModal
        isOpen={socialModalOpen}
        onClose={() => setSocialModalOpen(false)}
        initial={editingSocial}
        onSaved={async (form) => {
          if (!user) return;
          const next = { ...(user.social_links || {}) } as Record<
            string,
            string
          >;
          next[form.key] = form.url;
          const updated = await UserService.updateUser(user.id, {
            social_links: next as any,
          });
          if (updated) setUser(updated as User);
          notifySuccess("저장되었습니다.");
        }}
      />
    </div>
  );
}
