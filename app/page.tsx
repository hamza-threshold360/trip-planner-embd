export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white', padding: '40px 32px' }}>
      {/* Static page heading */}
      <div style={{ maxWidth: '1152px', margin: '0 auto 24px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 300, color: '#1f2937', letterSpacing: '-0.025em', margin: 0 }}>
          Itinerary Builder
        </h1>
      </div>

      {/* Embedded iframe */}
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
        <iframe
          src="https://itinerary-builder-t360.netlify.app/"
          width="100%"
          height="720"
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            display: 'block',
          }}
          title="Itinerary Builder"
        />
      </div>
    </div>
  );
}
