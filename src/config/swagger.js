const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Survey Lokasi API",
      version: "1.0.0",
      description:
        "Backend REST API untuk aplikasi Survey Lokasi Objek dengan fitur lengkap User Management dan Dashboard Analytics",
      contact: {
        name: "API Support",
        email: "support@surveylokasi.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.surveylokasi.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            'JWT Authorization header menggunakan Bearer scheme. Example: "Bearer {token}"',
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id_user: {
              type: "integer",
              description: "User ID",
            },
            username: {
              type: "string",
              description: "Username (unique)",
            },
            no_hp: {
              type: "string",
              description: "Nomor HP",
            },
            alamat: {
              type: "string",
              description: "Alamat lengkap",
            },
            ktp: {
              type: "string",
              description: "Nomor KTP",
            },
            keterangan: {
              type: "string",
              description: "Keterangan user",
            },
            role_user: {
              type: "integer",
              enum: [1, 2],
              description: "1 = Admin, 2 = Surveyor",
            },
            create_user_date: {
              type: "string",
              format: "date-time",
              description: "Tanggal dibuat",
            },
          },
        },
        Survey: {
          type: "object",
          properties: {
            id_survey: {
              type: "integer",
              description: "Survey ID",
            },
            id_user: {
              type: "integer",
              description: "User ID yang membuat survey",
            },
            tgl_survey: {
              type: "string",
              format: "date-time",
              description: "Tanggal survey dibuat",
            },
            foto: {
              type: "string",
              description: "Path foto survey",
            },
            longitude_x: {
              type: "number",
              format: "double",
              minimum: -180,
              maximum: 180,
              description: "GPS Longitude (otomatis dari device)",
            },
            latitude_y: {
              type: "number",
              format: "double",
              minimum: -90,
              maximum: 90,
              description: "GPS Latitude (otomatis dari device)",
            },
            alamat_google: {
              type: "string",
              description: "Alamat dari Google Maps (optional)",
            },
            alamat_keterangan: {
              type: "string",
              description: "Alamat manual dari surveyor (required)",
            },
            dokumen: {
              type: "string",
              description: "Path dokumen pendukung",
            },
            dokumen_keterangan: {
              type: "string",
              description: "Keterangan dokumen",
            },
            tgl_simpan_edit: {
              type: "string",
              format: "date-time",
              description: "Tanggal terakhir disimpan/diedit",
            },
            tgl_submit: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Tanggal submit (null jika belum submit)",
            },
            status: {
              type: "string",
              enum: ["TERSIMPAN", "TERKIRIM"],
              description:
                "Status survey: TERSIMPAN (draft) atau TERKIRIM (submitted)",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              description: "Error message",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "Endpoint untuk login dan autentikasi",
      },
      {
        name: "Survey",
        description: "CRUD operations untuk survey lokasi",
      },
      {
        name: "User Management",
        description: "Kelola user (Admin only)",
      },
      {
        name: "Dashboard",
        description: "Analytics dan statistik (Admin only)",
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
