import uuid, random
from datetime import datetime, timedelta

def uid(): return str(uuid.uuid4())
def ago(days): return (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%dT%H:%M:%S.000Z')
def future(days): return (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%dT%H:%M:%S.000Z')

h = "$2b$10$ARXP0GfF6GY75fJNmJBCiO71RNVZNYOSRYBylNkt/qLqys0iFCMTK"
a1=uid(); a2=uid(); a3=uid()
e1=uid(); e2=uid(); e3=uid(); e4=uid()
q1=uid();q2=uid();q3=uid();q4=uid();q5=uid();q6=uid();q7=uid();q8=uid()

sql = []

# ADMINS
sql.append('INSERT INTO "Admin" (id,nama,email,"passwordHash",role) VALUES\n' + ','.join([
  f"('{a1}','Admin Pendidikan','admin@pendidikan.id','{h}','SUPER_ADMIN')",
  f"('{a2}','Budi Santoso','budi@pendidikan.id','{h}','ADMIN')",
  f"('{a3}','Sari Dewi','sari@pendidikan.id','{h}','ADMIN')"
]) + ' ON CONFLICT (email) DO NOTHING;')

# EVENTS
ty='{"showWA":true,"waNumber":"6281234567890","message":"Terima kasih sudah mendaftar!"}'
nf='{"remindDaysBefore":3,"remindHoursBefore":2}'
sql.append('INSERT INTO "Event" (id,nama,slug,deskripsi,lokasi,"googleMapsUrl","tanggalMulai","tanggalSelesai","warnaAksen",kuota,status,"thankYouConfig","notifConfig","createdAt","updatedAt") VALUES\n' + ','.join([
  f"('{e1}','Seminar Digital Marketing 2025','seminar-digital-marketing-2025','Pelajari strategi digital marketing terbaru.','Gedung Serba Guna Univ Nusantara, Jakarta Selatan','https://maps.google.com/?q=-6.2615,106.8100','{future(14)}','{future(14)}','#2563eb',150,'PUBLISHED','{ty}','{nf}',NOW(),NOW())",
  f"('{e2}','Workshop UI/UX Design','workshop-ui-ux-design','Workshop intensif 3 hari belajar UI/UX Design.','CoWorking Space Kreatif, Bandung',NULL,'{future(30)}','{future(32)}','#7c3aed',40,'PUBLISHED',NULL,NULL,NOW(),NOW())",
  f"('{e3}','Pelatihan Python untuk Pemula','pelatihan-python-pemula','Belajar Python dari dasar.','Lab Komputer Univ Terbuka, Surabaya',NULL,'{ago(20)}','{ago(18)}','#059669',60,'SELESAI',NULL,NULL,NOW(),NOW())",
  f"('{e4}','Talkshow Karir di Bidang Tech','talkshow-karir-tech','Diskusi panel bersama engineer senior.','Auditorium BINUS, Jakarta Pusat',NULL,'{future(7)}','{future(7)}','#dc2626',200,'CLOSED',NULL,NULL,NOW(),NOW())",
]) + ' ON CONFLICT (slug) DO NOTHING;')

# QUESTIONS
sql.append('INSERT INTO "EventQuestion" (id,"eventId",label,tipe,"opsiJawaban",wajib,urutan,"createdAt") VALUES\n' + ','.join([
  f"('{q1}','{e1}','Asal Universitas','TEXT',NULL,true,1,NOW())",
  f"('{q2}','{e1}','Tingkat Kemahiran','SINGLE_CHOICE','[\"Pemula\",\"Menengah\",\"Lanjutan\"]',true,2,NOW())",
  f"('{q3}','{e1}','Topik favorit','MULTIPLE_CHOICE','[\"SEO\",\"Social Media Ads\",\"Content Marketing\",\"Email Marketing\",\"Analytics\"]',false,3,NOW())",
  f"('{q4}','{e2}','Portofolio Design','TEXT',NULL,true,1,NOW())",
  f"('{q5}','{e2}','Software favorit','DROPDOWN','[\"Figma\",\"Adobe XD\",\"Sketch\",\"Canva\",\"Lainnya\"]',true,2,NOW())",
  f"('{q6}','{e2}','Upload CV','FILE_UPLOAD',NULL,false,3,NOW())",
  f"('{q7}','{e3}','Pengalaman coding','SINGLE_CHOICE','[\"Tidak ada\",\"< 6 bulan\",\"6 bulan - 1 tahun\",\"> 1 tahun\"]',true,1,NOW())",
  f"('{q8}','{e4}','Posisi diminati','MULTIPLE_CHOICE','[\"Software Engineer\",\"Data Scientist\",\"Product Manager\",\"UI/UX Designer\",\"DevOps\"]',true,1,NOW())",
]) + ';')

# PESERTA
nm=[("081234560001","Ahmad Fauzi","Jakarta","Fauzi Digital","Instagram"),("081234560002","Rina Marlina","Bandung",None,"Teman"),("081234560003","Dwi Kurniawan","Surabaya","Kurniawan Tech","LinkedIn"),("081234560004","Siti Nurhaliza","Yogyakarta",None,"Website"),("081234560005","Bambang Pamungkas","Semarang","BP Creative","Instagram"),("081234560006","Maya Putri","Medan",None,"YouTube"),("081234560007","Fajar Nugroho","Makassar","Nugroho Studio","TikTok"),("081234560008","Diana Puspita","Malang",None,"Instagram"),("081234560009","Rizky Pratama","Palembang","Rizky Coding","Teman"),("081234560010","Lestari Wulan","Bali",None,"Eventbrite"),("081234560011","Hendra Wijaya","Jakarta","Wijaya Corp","Google"),("081234560012","Anisa Rahma","Bandung",None,"Instagram"),("081234560013","Tono Sugiarto","Solo","Tono Workshop","WhatsApp Group"),("081234560014","Putri Ayu","Manado",None,"Facebook"),("081234560015","Dimas Aditya","Yogyakarta","Aditya Dev","LinkedIn")]
ps=[]; pv=[]
for nw,na,dom,bis,smb in nm:
    pid=uid(); ps.append((pid,nw))
    nb=f"'{bis}'" if bis else "NULL"
    pv.append(f"('{pid}','{nw}','{na}','{dom}',{nb},'AKTIF','{smb}',NOW(),NOW())")
sql.append('INSERT INTO "Peserta" (id,"noWa",nama,domisili,"namaBisnis","statusKeanggotaan","sumberInformasi","createdAt","updatedAt") VALUES\n' + ','.join(pv) + ' ON CONFLICT ("noWa") DO NOTHING;')

# REGISTRASI
rv=[]; rc=0
for i in range(10):
    rid=uid();pid=ps[i][0];st="HADIR" if i<3 else "TERDAFTAR"
    wd=ago(random.randint(1,10));wh=f"'{ago(random.randint(0,5))}'" if st=="HADIR" else "NULL"
    rv.append(f"('{rid}','{e1}','{pid}','{st}','{wd}',{wh})");rc+=1
for i in range(6):
    rid=uid();pid=ps[i+4][0];wd=ago(random.randint(1,15))
    rv.append(f"('{rid}','{e2}','{pid}','TERDAFTAR','{wd}',NULL)");rc+=1
for i in range(8):
    rid=uid();pid=ps[i+2][0];wd=ago(random.randint(25,35));wh=ago(20)
    rv.append(f"('{rid}','{e3}','{pid}','HADIR','{wd}','{wh}')");rc+=1
for i in range(12):
    rid=uid();pid=ps[i%15][0];st="HADIR" if i<5 else "TERDAFTAR"
    wd=ago(random.randint(1,20));wh=f"'{ago(random.randint(0,7))}'" if st=="HADIR" else "NULL"
    rv.append(f"('{rid}','{e4}','{pid}','{st}','{wd}',{wh})");rc+=1
sql.append('INSERT INTO "Registrasi" (id,"eventId","pesertaId",status,"waktuDaftar","waktuHadir") VALUES\n' + ','.join(rv) + ' ON CONFLICT ("eventId","pesertaId") DO NOTHING;')

# JAWABAN KUSTOM
uv=["Universitas Nusantara","Institut Teknologi Bandung","Universitas Gadjah Mada","Universitas Padjadjaran","Binus University"]
lv=["Pemula","Menengah","Lanjutan","Pemula","Menengah"]
jv=[]
for i in range(5):
    rid=rv[i].split("'")[1]
    jv.append(f"('{uid()}','{rid}','{q1}','{uv[i]}')")
    jv.append(f"('{uid()}','{rid}','{q2}','{lv[i]}')")
    jv.append(f"('{uid()}','{rid}','{q3}','[\"SEO\",\"Social Media Ads\"]')")
sql.append('INSERT INTO "JawabanKustom" (id,"registrasiId","eventQuestionId",nilai) VALUES\n' + ','.join(jv) + ';')

# AUDIT LOG
av=[]
for aid,anm,act,ent,eid in [(a1,"Admin Pendidikan","LOGIN","Admin",a1),(a1,"Admin Pendidikan","CREATE","Event",e1),(a1,"Admin Pendidikan","UPDATE","Event",e1),(a2,"Budi Santoso","LOGIN","Admin",a2),(a2,"Budi Santoso","CREATE","Event",e2),(a1,"Admin Pendidikan","EXPORT","Registrasi",e3),(a1,"Admin Pendidikan","CHECKIN","Peserta",ps[0][0])]:
    d={"LOGIN":"NULL","CREATE":'{"nama":"Event"}',"UPDATE":'{"field":"status"}',"EXPORT":'{"format":"xlsx","count":8}',"CHECKIN":'{"nama":"Ahmad Fauzi"}'}[act]
    av.append(f"('{uid()}','{aid}','{anm}','{act}','{ent}','{eid}',{d if d=='NULL' else d+'::jsonb'},'{ago(random.randint(0,10))}')")
sql.append('INSERT INTO "AuditLog" (id,"adminId","adminNama",aksi,entitas,"entitasId",detail,"createdAt") VALUES\n' + ','.join(av) + ';')

with open("/d/APP/repos/ngopbis/scripts/seed.sql","w") as f:
    f.write("\n".join(sql))
print(f"OK: {rc} regs, {len(jv)} jawaban, {len(av)} audit")
